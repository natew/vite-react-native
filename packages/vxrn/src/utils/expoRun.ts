import module from 'node:module'
import { fillOptions } from '../utils/getOptionsFilled'
import { applyBuiltInPatches } from '../utils/patches'
import picocolors from 'picocolors'

export async function expoRun({ root, platform }: { root: string; platform: 'ios' | 'android' }) {
  if (platform !== 'ios') {
    console.warn(
      picocolors.yellow(
        `🚧  The ${platform} platform is not supported yet, we're still working on it and you might encounter unexpected errors. Please try iOS first, if possible.`
      )
    )
  }

  const options = await fillOptions({ root })

  applyBuiltInPatches(options).catch((err) => {
    console.error(`\n 🥺 error applying built-in patches`, err)
  })

  try {
    // Import Expo from the user's project instead of from where vxrn is installed, since vxrn may be installed globally or at the root workspace.
    const require = module.createRequire(root)
    const importPath = require.resolve(`@expo/cli/build/src/run/${platform}/index.js`, {
      paths: [root],
    })
    const expoRun = (await import(importPath)).default[
      `expoRun${platform.charAt(0).toUpperCase() + platform.slice(1)}`
    ]
    await expoRun([
      '--no-bundler', // Do not start the Metro bundler automatically
    ])
  } catch (e) {
    console.error(`Failed to run native project: ${e}\nIs "expo" listed in your dependencies?`)
  }
}
