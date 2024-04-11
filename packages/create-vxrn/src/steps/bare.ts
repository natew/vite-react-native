import ansis from 'ansis'
import fs from 'fs-extra'
import type { ExtraSteps } from './types'
import { join, basename, dirname } from 'node:path'

function shouldIgnoreFile(filePath: string) {
  return filePath.match(/node_modules|yarn.lock|package-lock.json/g)
}

function shouldRenameFile(filePath: string, nameToReplace: string) {
  return basename(filePath).includes(nameToReplace)
}

async function renameFile(filePath: string, oldName: string, newName: string) {
  const newFileName = join(
    dirname(filePath),
    basename(filePath).replace(new RegExp(oldName, 'g'), newName)
  )

  console.debug(`Renaming ${filePath} -> file:${newFileName}`)

  await fs.rename(filePath, newFileName)
}

function walk(current: string): string[] {
  if (!fs.lstatSync(current).isDirectory()) {
    return [current]
  }

  const files = fs.readdirSync(current).map((child) => walk(join(current, child)))
  const result: string[] = []
  return result.concat.apply([current], files)
}

export async function replaceNameInUTF8File(
  filePath: string,
  projectName: string,
  templateName: string
) {
  console.debug(`Replacing in ${filePath}`)
  const fileContent = await fs.readFile(filePath, 'utf8')
  const replacedFileContent = fileContent
    .replace(new RegExp(templateName, 'g'), projectName)
    .replace(new RegExp(templateName.toLowerCase(), 'g'), projectName.toLowerCase())

  if (fileContent !== replacedFileContent) {
    await fs.writeFile(filePath, replacedFileContent, 'utf8')
  }
}

const main: ExtraSteps = async ({ isFullClone, projectName }) => {
  const placeholderName = 'bare'

  if (projectName === placeholderName) {
    console.error(`
  ${ansis.red.bold('Error:')} Bare project cannot be named ${ansis.underline('bare')}.`)
    process.exit(0)
  }

  for (const filePath of walk(process.cwd()).reverse()) {
    if (shouldIgnoreFile(filePath)) {
      continue
    }

    if (!(await fs.stat(filePath)).isDirectory()) {
      await replaceNameInUTF8File(filePath, projectName, 'bare')
    }

    if (shouldRenameFile(filePath, placeholderName)) {
      await renameFile(filePath, placeholderName, projectName)
    } else if (shouldRenameFile(filePath, placeholderName.toLowerCase())) {
      await renameFile(filePath, placeholderName.toLowerCase(), projectName.toLowerCase())
    }
  }
  if (isFullClone) {
    console.info(`
${ansis.green.bold('Done!')} created a new project under ./${projectName}

visit your project:
${ansis.green('cd')} ${projectName}

${ansis.green(`Run instructions for ${ansis.bold('Android')}:`)}
  • Have an Android emulator running (quickest way to get started), or a device connected.
  • npx react-native run-android

${ansis.blue(`Run instructions for ${ansis.blue('iOS')}:`)}
  • Install Cocoapods
    • bundle install # you need to run this only once in your project.
    • bundle exec pod install
    • cd ..

  • npx react-native run-ios
  - or -
  • Open ${projectName}/ios/${projectName}.xcworkspace in Xcode or run "xed -b ios"
  • Hit the Run button

`)
  }
}

export default main
