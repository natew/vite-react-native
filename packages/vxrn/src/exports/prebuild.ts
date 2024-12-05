import module from 'node:module'
import path from 'node:path'
import FSExtra from 'fs-extra'
import { fillOptions } from '../utils/getOptionsFilled'
import { applyBuiltInPatches } from '../utils/patches'

export const prebuild = async ({
  root,
  platform,
}: { root: string; platform?: 'ios' | 'android' }) => {
  const options = await fillOptions({ root })

  applyBuiltInPatches(options).catch((err) => {
    console.error(`\n 🥺 error applying built-in patches`, err)
  })

  try {
    // Import Expo from the user's project instead of from where vxrn is installed, since vxrn may be installed globally or at the root workspace.
    const require = module.createRequire(root)
    const importPath = require.resolve('@expo/cli/build/src/prebuild/index.js', {
      paths: [root],
    })
    const expoPrebuild = (await import(importPath)).default.expoPrebuild
    await expoPrebuild([
      ...(platform ? ['--platform', platform] : []),
      '--skip-dependency-update',
      'react,react-native,expo',
    ])

    try {
      const packageJsonPath = path.join(root, 'package.json')
      let packageJsonContents = await FSExtra.readFile(packageJsonPath, 'utf8')

      packageJsonContents = packageJsonContents.replace(/expo run:ios/g, 'one run:ios')
      packageJsonContents = packageJsonContents.replace(/expo run:android/g, 'one run:android')

      await FSExtra.writeFile(packageJsonPath, packageJsonContents, 'utf8')
    } catch (error) {
      console.error('Error updating package.json', error)
    }

    // Remove the ios/.xcode.env.local file as it's causing problems `node: No such file or directory` during build
    try {
      FSExtra.removeSync(path.join(root, 'ios', '.xcode.env.local'))
    } catch (e) {
      // ignore
    }

    console.info(
      'Run `open ios/*.xcworkspace` in your terminal to open the prebuilt iOS project, then you can either run it via Xcode or archive it for distribution.'
    )
  } catch (e) {
    console.error(`Failed to prebuild native project: ${e}\nIs "expo" listed in your dependencies?`)
  }
}
