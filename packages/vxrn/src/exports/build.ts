import FSExtra from 'fs-extra'
import { rm } from 'node:fs/promises'
import type { RollupOutput } from 'rollup'
import { mergeConfig, build as viteBuild, type Plugin, type UserConfig } from 'vite'
import { analyzer } from 'vite-bundle-analyzer'
import type { BuildArgs, VXRNConfig } from '../types'
import { getBaseViteConfig } from '../utils/getBaseViteConfig'
import { getOptimizeDeps } from '../utils/getOptimizeDeps'
import { getOptionsFilled } from '../utils/getOptionsFilled'

const { existsSync } = FSExtra

Error.stackTraceLimit = Number.POSITIVE_INFINITY

const disableOptimizationConfig = {
  optimizeDeps: {
    esbuildOptions: {
      minify: false,
    },
  },

  build: {
    minify: false,
    rollupOptions: {
      treeshake: false,
      output: {
        minifyInternalExports: false,
      },
    },
  },
} satisfies UserConfig

export const build = async (optionsIn: VXRNConfig, buildArgs: BuildArgs = {}) => {
  const options = await getOptionsFilled(optionsIn)

  // clean
  await Promise.all([
    (async () => {
      // lets always clean dist folder for now to be sure were correct
      if (existsSync('dist')) {
        await rm('dist', { recursive: true, force: true })
      }
    })(),
    (async () => {
      // lets always clean dist folder for now to be sure were correct
      if (existsSync('node_modules/.vite')) {
        await rm('node_modules/.vite', { recursive: true, force: true })
      }
    })(),
  ])

  // TODO?
  process.env.NODE_ENV = 'production'

  const { optimizeDeps } = getOptimizeDeps('build')

  let webBuildConfig = mergeConfig(
    getBaseViteConfig({
      mode: 'production',
    }),
    {
      root: options.root,
      clearScreen: false,
      optimizeDeps,
    } satisfies UserConfig
  )

  const excludeAPIRoutesPlugin = {
    enforce: 'pre',
    name: 'omit-api-routes',
    transform(code, id) {
      if (/\+api.tsx?$/.test(id)) {
        return ``
      }
    },
  } satisfies Plugin

  if (options.webConfig) {
    webBuildConfig = mergeConfig(webBuildConfig, options.webConfig) as any
  }

  let clientOutput

  if (buildArgs.step !== 'generate') {
    let clientBuildConfig = mergeConfig(webBuildConfig, {
      plugins: [
        excludeAPIRoutesPlugin,
        // if an error occurs (like can't find index.html, it seems to show an
        // error saying can't find report here instead, so a bit confusing)
        // process.env.NODE_ENV === 'production'
        //   ? analyzer({
        //       analyzerMode: 'static',
        //       fileName: '../report',
        //     })
        //   : null,
      ],

      build: {
        ssrManifest: true,
        outDir: 'dist/client',
        manifest: true,

        rollupOptions: {
          input: ['./src/entry.tsx']
        }
      },
    } satisfies UserConfig)

    if (process.env.VXRN_DISABLE_PROD_OPTIMIZATION) {
      clientBuildConfig = mergeConfig(clientBuildConfig, disableOptimizationConfig)
    }

    console.info(`\n 🔨 build client\n`)
    const { output } = (await viteBuild(clientBuildConfig)) as RollupOutput
    clientOutput = output
  }

  console.info(`\n 🔨 build server\n`)

  let serverBuildConfig = mergeConfig(webBuildConfig, {
    plugins: [excludeAPIRoutesPlugin],

    define: {
      'process.env.TAMAGUI_IS_SERVER': '"1"',
      ...webBuildConfig.define,
    },

    ssr: {
      noExternal: optimizeDeps.include,
      optimizeDeps,
    },

    build: {
      // we want one big file of css
      cssCodeSplit: false,
      ssr: 'src/entry.tsx',
      outDir: 'dist/server',
      rollupOptions: {
        external: [],
      },
    },
  } satisfies UserConfig)

  // if (process.env.VXRN_DISABLE_PROD_OPTIMIZATION) {
  //   serverBuildConfig = mergeConfig(serverBuildConfig, disableOptimizationConfig)
  // }

  const { output: serverOutput } = (await viteBuild(serverBuildConfig)) as RollupOutput

  if (options.afterBuild) {
    const clientManifest = await FSExtra.readJSON('dist/client/.vite/manifest.json')

    await options.afterBuild({
      options,
      buildArgs,
      clientOutput,
      serverOutput,
      webBuildConfig,
      clientManifest,
    })
  }

  console.info(`\n ✔️ build complete\n`)
}
