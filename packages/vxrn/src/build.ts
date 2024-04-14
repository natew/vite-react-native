import { resolve as importMetaResolve } from 'import-meta-resolve'
import fs from 'node:fs'
import path from 'node:path'
import { mergeConfig, build as viteBuild, type UserConfig } from 'vite'

import FSExtra from 'fs-extra'
import type { OutputAsset, OutputChunk, RollupOutput } from 'rollup'
import { clientBundleTreeShakePlugin } from './plugins/clientBundleTreeShakePlugin'
import type { VXRNConfig } from './types'
import { getBaseViteConfig } from './utils/getBaseViteConfig'
import { getOptionsFilled, type VXRNConfigFilled } from './utils/getOptionsFilled'

export const resolveFile = (path: string) => {
  try {
    return importMetaResolve(path, import.meta.url).replace('file://', '')
  } catch {
    return require.resolve(path)
  }
}

const { ensureDir, existsSync, readFile } = FSExtra

const extensions = [
  '.web.tsx',
  '.tsx',
  '.web.ts',
  '.ts',
  '.web.jsx',
  '.jsx',
  '.web.js',
  '.js',
  '.css',
  '.json',
]

export const build = async (optionsIn: VXRNConfig) => {
  const options = await getOptionsFilled(optionsIn)
  const depsToOptimize = [
    'react',
    'react-dom',
    '@react-native/normalize-color',
    '@react-navigation/native',
    'expo-constants',
    'expo-modules-core',
    'expo-status-bar',
  ]

  let buildConfig = mergeConfig(
    getBaseViteConfig({
      mode: 'production',
    }),
    {
      root: options.root,
      clearScreen: false,
      optimizeDeps: {
        include: depsToOptimize,
        esbuildOptions: {
          resolveExtensions: extensions,
        },
      },
    }
  ) satisfies UserConfig

  if (options.webConfig) {
    buildConfig = mergeConfig(buildConfig, options.webConfig) as any
  }

  console.info(`build client`)
  await viteBuild(
    mergeConfig(buildConfig, {
      plugins: [clientBundleTreeShakePlugin({})],
      build: {
        ssrManifest: true,
        outDir: 'dist/client',
      },
    } satisfies UserConfig)
  )

  console.info(`build server`)
  const { output } = (await viteBuild(
    mergeConfig(buildConfig, {
      resolve: {
        alias: {
          'react-native': 'react-native-web-lite',
        },
      },
      optimizeDeps: {
        esbuildOptions: {
          format: 'cjs',
        },
      },
      ssr: {
        noExternal: true,
      },
      build: {
        // we want one big file of css
        cssCodeSplit: false,
        ssr: 'src/entry-server.tsx',
        outDir: 'dist/server',
        rollupOptions: {
          external: [],
        },
      },
    } satisfies UserConfig)
  )) as RollupOutput

  console.info(`generating static pages`)
  await generateStaticPages(options, output)
}

async function generateStaticPages(
  options: VXRNConfigFilled,
  serverOutput: (OutputChunk | OutputAsset)[]
) {
  const toAbsolute = (p) => path.resolve(options.root, p)

  const staticDir = toAbsolute(`dist/static`)
  await ensureDir(staticDir)
  const template = fs.readFileSync(toAbsolute('index.html'), 'utf-8')
  const render = (await import(`${options.root}/dist/server/entry-server.js`)).render

  // load routes
  const entry = serverOutput.find(
    (x) => x.type === 'chunk' && x.facadeModuleId?.includes('entry-server')
  )

  const assets: OutputAsset[] = []

  const allRoutes = (
    await Promise.all(
      serverOutput.flatMap(async (output) => {
        if (output.type === 'asset') {
          assets.push(output)
          return []
        }

        const id = output.facadeModuleId || ''
        const file = path.basename(id)
        const name = file.replace(/\.[^/.]+$/, '')

        if (!id || file[0] === '_' || file.includes('entry-server')) {
          return []
        }

        const endpointPath = path.join(options.root, 'dist/server', output.fileName)
        const exported = await import(endpointPath)
        const staticParams = await exported.generateStaticParams?.()
        const result = (staticParams || [{}]).map((params) => {
          return getUrl(params)
        })

        function getUrl(params = {}) {
          return name === 'index'
            ? '/'
            : `/${name
                .split('/')
                .map((part) => {
                  if (part[0] === '[') {
                    const found = params[part.slice(1, part.length - 1)]
                    if (!found) {
                      console.warn('not found', { params, part })
                    }
                    return found
                  }
                  return part
                })
                .join('/')}`
        }

        return result
      })
    )
  ).flat()

  // for now just inline
  const cssString = assets
    .filter((x) => x.name?.endsWith('.css'))
    .map((x) => x.source)
    .join('\n\n')

  // pre-render each route...
  for (const path of allRoutes) {
    const { appHtml, headHtml } = await render({ path })
    const slashFileName = `${path === '/' ? '/index' : path}.html`
    const clientHtmlPath = toAbsolute(`dist/client${slashFileName}`)
    const clientHtml = existsSync(clientHtmlPath) ? await readFile(clientHtmlPath, 'utf-8') : null
    const html = (clientHtml || template)
      .replace(`<!--ssr-outlet-->`, appHtml)
      .replace(
        `<!--head-outlet-->`,
        `${headHtml}\n${cssString ? `<style>${cssString}</style>` : ``}`
      )
    const filePath = toAbsolute(`dist/static${slashFileName}`)
    fs.writeFileSync(toAbsolute(filePath), html)
  }
}
