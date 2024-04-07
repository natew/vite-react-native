#!/usr/bin/env node
// inspired by https://github.com/vercel/next.js/blob/0355e5f63f87db489f36db8d814958cb4c2b828b/packages/create-next-app/helpers/examples.ts#L71

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { cwd } from 'node:process'

import chalk from 'chalk'
import Commander from 'commander'
import { detect } from 'detect-package-manager'
import { existsSync, readFileSync, writeFileSync } from 'fs-extra'
import { cd } from 'zx'

import packageJson from '../package.json'
import { cloneStarter } from './helpers/cloneStarter'
import { getProjectName } from './helpers/getProjectName'
import { getTemplateInfo } from './helpers/getTemplateInfo'
import { installDependencies } from './helpers/installDependencies'
import { validateNpmName } from './helpers/validateNpmPackage'

let projectPath = ''

function exit() {
  process.exit(0)
}

process.on('SIGTERM', exit)
process.on('SIGINT', exit)

const program = new Commander.Command(packageJson.name)
  .version(packageJson.version)
  .arguments('<project-directory>')
  .action((name) => {
    projectPath = name
  })
  .option(`--info`, 'Just shows the setup guide for the starter.')
  .option(
    `--template <template>, -t <template>`,
    'Choose between four or more starter templates.',
    ''
  )
  .allowUnknownOption()
  .usage(
    `${chalk.green('<project-directory>')} [options]

Example usage:

${chalk.blueBright(`npx ${packageJson.name} next-expo`)}`
  )
  .parse(process.argv)

if (process.argv.includes('--version')) {
  console.info(packageJson.version)
  process.exit(0)
}
const info = !!program.info

async function run() {
  if (info) {
    let template = await getTemplateInfo(program.template)
    await template.extraSteps({
      isFullClone: false,
      projectName: path.basename(cwd()),
      projectPath: cwd(),
    })
    return
  }

  console.info()
  console.info(
    chalk.bold(' Note: You may need to run "npm create vxrn@latest" to get the latest version!')
  )
  console.info()

  console.info() // this newline prevents the ascii art from breaking
  console.info(chalk.bold('Creating vxrn app...'))

  const gitVersionString = parseFloat(
    execSync(`git --version`).toString().replace(`git version `, '').trim()
  )
  if (gitVersionString < 2.27) {
    console.error(`\n\n ⚠️ vxrn can't install: Git version must be >= 2.27\n\n`)
    process.exit(1)
  }

  projectPath ||= await getProjectName(projectPath)

  let template = await getTemplateInfo(program.template)

  // space
  console.info()

  const resolvedProjectPath = path.resolve(process.cwd(), projectPath)
  const projectName = path.basename(resolvedProjectPath)

  const { valid, problems } = validateNpmName(projectName)
  if (!valid) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${projectName}"`
      )} because of npm naming restrictions:`
    )

    problems!.forEach((p) => console.error(`    ${chalk.red.bold('*')} ${p}`))
    process.exit(1)
  }

  if (fs.existsSync(resolvedProjectPath)) {
    console.info()
    console.info(
      chalk.red('🚨 [vxrn] error'),
      `You tried to make a project called ${chalk.underline(
        chalk.blueBright(projectName)
      )}, but a folder with that name already exists: ${chalk.blueBright(resolvedProjectPath)}

${chalk.bold(chalk.red(`Please pick a different project name 🥸`))}`
    )
    console.info()
    console.info()
    process.exit(1)
  }
  console.info()
  console.info(`Creating a new vxrn app ${chalk.blueBright(resolvedProjectPath)}...`)
  fs.mkdirSync(resolvedProjectPath)
  console.info(chalk.green(`${projectName} folder created.`))

  try {
    await cloneStarter(template, resolvedProjectPath, projectName)
    cd(resolvedProjectPath)
    // space
    console.info()
  } catch (e) {
    console.error(`[vxrn] Failed to copy example into ${resolvedProjectPath}\n\n`, e)
    process.exit(1)
  }

  // change root package.json's name to project name
  updatePackageJsonName(projectName, resolvedProjectPath)

  console.info('Installing packages. This might take a couple of minutes.')
  console.info()

  const packageManager =
    ('packageManager' in template ? template.packageManager : undefined) || (await detect())

  try {
    console.info('installing with ' + packageManager)
    await installDependencies(resolvedProjectPath, packageManager as any)
  } catch (e: any) {
    console.error('[vxrn] error installing with ' + packageManager + '\n' + `${e}`)
    process.exit(1)
  }

  await template.extraSteps({
    isFullClone: true,
    projectName,
    projectPath: resolvedProjectPath,
  })

  console.info()
}

function updatePackageJsonName(projectName: string, dir: string) {
  const packageJsonPath = path.join(dir, 'package.json')
  if (existsSync(packageJsonPath)) {
    const content = readFileSync(packageJsonPath).toString()
    const contentWithUpdatedName = content.replace(/("name": ")(.*)(",)/, `$1${projectName}$3`)
    writeFileSync(packageJsonPath, contentWithUpdatedName)
  }
}

run()
