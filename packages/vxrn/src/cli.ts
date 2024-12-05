import { defineCommand, runMain } from 'citty'
import type { dev as devFn } from './exports/dev'
import type { prebuild as prebuildFn } from './exports/prebuild'
import type { runIos as runIosFn } from './exports/runIos'
import type { runAndroid as runAndroidFn } from './exports/runAndroid'

const dev = defineCommand({
  meta: {
    name: 'dev',
    version: '0.0.0',
    description: 'Start the dev server',
  },
  args: {
    clean: {
      type: 'boolean',
    },
    host: {
      type: 'string',
    },
    port: {
      type: 'string',
    },
    https: {
      type: 'boolean',
    },
  },
  async run({ args }) {
    const imported = await import(
      // @ts-expect-error
      './exports/dev.mjs'
    )

    // for type safety with our weird import setup
    const dev = imported.dev as typeof devFn

    const { start, stop } = await dev({
      clean: args.clean,
      root: process.cwd(),
      server: {
        https: args.https,
        host: args.host,
        port: args.port ? +args.port : undefined,
      },
    })

    const { closePromise } = await start()

    process.on('beforeExit', () => {
      stop()
    })

    process.on('SIGINT', () => {
      stop()
    })

    process.on('uncaughtException', (err) => {
      console.error(err?.message || err)
    })

    await closePromise
  },
})

const build = defineCommand({
  meta: {
    name: 'build',
    version: '0.0.0',
    description: 'Build your app',
  },
  args: {
    step: {
      type: 'string',
      required: false,
    },
    // limit the pages built
    only: {
      type: 'string',
      required: false,
    },
    analyze: {
      type: 'boolean',
      required: false,
    },
  },
  async run({ args }) {
    const { build } = await import(
      // @ts-expect-error
      './exports/build.mjs'
    )

    process.on('uncaughtException', (err) => {
      console.error(err?.message || err)
    })

    const results = await build({}, args)

    if (process.env.DEBUG) {
      console.info('results', results)
    }
  },
})

const serve = defineCommand({
  meta: {
    name: 'serve',
    version: '0.0.0',
    description: 'Serve a built app for production',
  },
  args: {
    host: {
      type: 'string',
    },
    port: {
      type: 'string',
    },
  },
  async run({ args }) {
    const { serve } = await import(
      // @ts-expect-error
      './exports/serve.mjs'
    )

    process.on('uncaughtException', (err) => {
      console.error(err?.message || err)
    })

    const results = await serve({
      port: args.port ? +args.port : undefined,
      host: args.host,
    })

    if (process.env.DEBUG) {
      console.info('results', results)
    }
  },
})

const prebuild = defineCommand({
  meta: {
    name: 'prebuild',
    version: '0.0.0',
    description: 'Prebuild native iOS project', // TODO: Android
  },
  args: {
    platform: {
      type: 'string',
    },
  },
  async run({ args }) {
    const imported = await import(
      // @ts-expect-error
      './exports/prebuild.mjs'
    )
    const prebuild = imported.prebuild as typeof prebuildFn
    const root = process.cwd()
    const { platform } = args

    await prebuild({ root, platform })
  },
})

const runIos = defineCommand({
  meta: {
    name: 'run:ios',
    version: '0.0.0',
  },
  args: {},
  async run() {
    const imported = await import(
      // @ts-expect-error
      './exports/runIos.mjs'
    )
    const runIos = imported.runIos as typeof runIosFn
    const root = process.cwd()

    await runIos({ root })
  },
})

const runAndroid = defineCommand({
  meta: {
    name: 'run:android',
    version: '0.0.0',
  },
  args: {},
  async run() {
    const imported = await import(
      // @ts-expect-error
      './exports/runAndroid.mjs'
    )
    const runAndroid = imported.runAndroid as typeof runAndroidFn
    const root = process.cwd()

    await runAndroid({ root })
  },
})

const patch = defineCommand({
  meta: {
    name: 'patch',
    version: '0.0.0',
    description: 'Apply package patches',
  },
  args: {},
  async run() {
    const { patch: vxrnPatch } = await import(
      // @ts-expect-error
      './exports/patch.mjs'
    )
    await vxrnPatch({
      root: process.cwd(),
    })
  },
})

const clean = defineCommand({
  meta: {
    name: 'clean',
    version: '0.0.0',
    description: 'Clean build folders',
  },
  args: {},
  async run() {
    const { clean: vxrnClean } = await import(
      // @ts-expect-error
      './exports/clean.mjs'
    )
    await vxrnClean({
      root: process.cwd(),
    })
  },
})

const main = defineCommand({
  meta: {
    name: 'main',
    version: '0.0.0',
    description: 'Welcome to vxrn',
  },
  subCommands: {
    dev,
    build,
    serve,
    prebuild,
    runIos,
    runAndroid,
    clean,
    patch,
  },
})

runMain(main)
