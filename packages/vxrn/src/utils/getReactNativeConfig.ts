import nodeResolve from '@rollup/plugin-node-resolve'
import viteNativeSWC, { swcTransform } from '@vxrn/vite-native-swc'
import { stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import {
  type InlineConfig,
  type Plugin,
  resolveConfig,
  type ResolvedConfig,
  transformWithEsbuild,
  type UserConfig,
} from 'vite'
import { DEFAULT_ASSET_EXTS } from '../constants/defaults'
import { getBabelReanimatedPlugin } from '../plugins/babelReanimated'
import { nativeClientInjectPlugin } from '../plugins/clientInjectPlugin'
import { reactNativeCommonJsPlugin } from '../plugins/reactNativeCommonJsPlugin'
import { reactNativeDevAssetPlugin } from '../plugins/reactNativeDevAssetPlugin'
import { dedupe } from './getBaseViteConfig'
import { getOptimizeDeps } from './getOptimizeDeps'
import type { VXRNOptionsFilled } from './getOptionsFilled'
import { swapPrebuiltReactModules } from './swapPrebuiltReactModules'
import typescript from '@rollup/plugin-typescript'

// Suppress these logs:
// * Use of eval in "(...)/react-native-prebuilt/vendor/react-native-0.74.1/index.js" is strongly discouraged as it poses security risks and may cause issues with minification.
// * Use of eval in "(...)/one/dist/esm/useLoader.native.js" is strongly discouraged as it poses security risks and may cause issues with minification.
// (not an exhaustive list)
const IGNORE_ROLLUP_LOGS_RE =
  /vite-native-client\/dist\/esm\/client|node_modules\/\.vxrn\/react-native|react-native-prebuilt\/vendor|one\/dist/

export async function getReactNativeConfig(
  options: VXRNOptionsFilled,
  internal: { mode?: 'dev' | 'prod'; assetsDest?: string } = { mode: 'dev' }
) {
  const {
    root,
    server: { port },
  } = options
  const { optimizeDeps } = getOptimizeDeps('build')

  const { mode } = internal
  const serverUrl = process.env.ONE_SERVER_URL || options.server.url

  // build app
  let nativeBuildConfig = {
    plugins: [
      ...(globalThis.__vxrnAddNativePlugins || []),

      ...(mode === 'dev' ? [nativeClientInjectPlugin()] : []),

      // vite doesnt support importing from a directory but its so common in react native
      // so lets make it work, and node resolve theoretically fixes but you have to pass in moduleDirs
      // but we need this to work anywhere including in normal source files
      {
        name: 'node-dir-imports',
        enforce: 'pre',

        async resolveId(importee, importer) {
          if (!importer || !importee.startsWith('./')) {
            return null
          }
          // let nodeResolve handle node_modules
          if (importer?.includes('node_modules')) {
            return
          }
          try {
            const resolved = join(dirname(importer), importee)
            if ((await stat(resolved)).isDirectory()) {
              // fix for importing a directory
              // TODO this would probably want to support their configured extensions
              // TODO also platform-specific extensions
              for (const ext of ['ts', 'tsx', 'mjs', 'js']) {
                try {
                  const withExt = join(resolved, `index.${ext}`)
                  await stat(withExt)
                  // its a match
                  return withExt
                } catch {
                  // keep going
                }
              }
            }
          } catch {
            // not a dir keep going
          }
        },
      } satisfies Plugin,

      nodeResolve(),

      swapPrebuiltReactModules(options.cacheDir, {
        // TODO: a better way to pass the mode (dev/prod) to PrebuiltReactModules
        mode: internal.mode,
      }),

      reactNativeDevAssetPlugin({
        projectRoot: options.root,
        mode: internal.mode,
        assetsDest: internal.assetsDest,
        assetExts: DEFAULT_ASSET_EXTS,
      }),

      getBabelReanimatedPlugin(),

      reactNativeCommonJsPlugin({
        root,
        port,
        mode: 'build',
      }),

      // Avoid "failed to read input source map: failed to parse inline source map url" errors on certain packages, such as react-native-reanimated.
      {
        name: 'remove-inline-source-maps',
        transform: {
          order: 'pre',
          async handler(code, id) {
            if (!id.includes('react-native-reanimated')) {
              return null
            }

            const inlineSourceMapIndex = code.lastIndexOf('//# sourceMappingURL=')
            if (inlineSourceMapIndex >= 0) {
              return code.slice(0, inlineSourceMapIndex).trimEnd()
            }

            return null
          },
        },
      },

      viteNativeSWC({
        tsDecorators: true,
        mode: 'build',
        production: mode === 'prod',
      }),

      typescript(),

      {
        name: 'fix-node-module-transforms',
        transform: {
          order: 'pre',
          async handler(code, id) {
            if (!id.includes('node_modules')) {
              return
            }

            // // typescript support
            // doesnt work because if they dont use import type etc then rollup fails not seeing matching export
            // if (/\.tsx?$/.test(id)) {
            //   return await swcTransform(id, code, {
            //     mode: mode === 'dev' ? 'serve' : 'build',
            //   })
            // }

            if (!id.includes('node_modules/expo-') && !id.includes('node_modules/@expo/')) {
              return null
            }

            // Use the exposed transform from vite, instead of directly
            // transforming with esbuild
            return transformWithEsbuild(code, id, {
              loader: 'jsx',
              jsx: 'automatic',
            })
          },
        },
      },
    ].filter(Boolean),

    appType: 'custom',
    root,
    clearScreen: false,

    optimizeDeps: {
      ...optimizeDeps,
      esbuildOptions: {
        jsx: 'automatic',
      },
    },

    resolve: {
      dedupe,
    },

    mode: mode === 'dev' ? 'development' : 'production',

    define: {
      'process.env.NODE_ENV': mode === 'dev' ? `"development"` : `"production"`,
      'process.env.ONE_SERVER_URL': JSON.stringify(serverUrl),
    },

    build: {
      ssr: false,
      minify: false,
      commonjsOptions: {
        transformMixedEsModules: true,
        ignore(id) {
          return id === 'react/jsx-runtime' || id === 'react/jsx-dev-runtime'
        },
      },
      rollupOptions: {
        input: options.entries.native,
        treeshake: false,
        preserveEntrySignatures: 'strict',
        output: {
          preserveModules: true,
          format: 'cjs',
        },

        onwarn(message, warn) {
          // Suppress "Module level directives cause errors when bundled" warnings
          if (!process.env.DEBUG?.startsWith('vxrn')) {
            if (
              message.code === 'MODULE_LEVEL_DIRECTIVE' ||
              message.code === 'INVALID_ANNOTATION' ||
              message.code === 'MISSING_EXPORT' ||
              message.code === 'SOURCEMAP_ERROR'
            ) {
              warnAboutSuppressingLogsOnce()
              return
            }
          }
          warn(message)
        },

        onLog(level, log, handler) {
          if (!process.env.DEBUG?.startsWith('vxrn')) {
            if (IGNORE_ROLLUP_LOGS_RE.test(log.message)) {
              warnAboutSuppressingLogsOnce()
              return
            }
          }

          handler(level, log)
        },
      },
    },
  } satisfies InlineConfig

  // TODO
  // if (options.nativeConfig) {
  //   nativeBuildConfig = mergeConfig(nativeBuildConfig, options.nativeConfig) as any
  // }

  // // this fixes my swap-react-native plugin not being called pre 😳
  resolvedConfig = await resolveConfig(nativeBuildConfig, 'build')

  return nativeBuildConfig satisfies UserConfig
}

let resolvedConfig: ResolvedConfig | null = null
export function getReactNativeResolvedConfig() {
  return resolvedConfig
}

let didWarnSuppressingLogs = false
function warnAboutSuppressingLogsOnce() {
  if (!didWarnSuppressingLogs) {
    didWarnSuppressingLogs = true
    // honestly they are harmdless so no need to warn, but it would be nice to do it once ever and then save that we did to disk
    // console.warn(` [vxrn] Suppressing mostly harmless logs, enable with DEBUG=vxrn`)
  }
}
