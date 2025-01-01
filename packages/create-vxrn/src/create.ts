import ansis from 'ansis'
import FSExtra from 'fs-extra'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'
import { cloneStarter } from './helpers/cloneStarter'
import { getProjectName } from './helpers/getProjectName'
import { getTemplateInfo } from './helpers/getTemplateInfo'
import { installDependencies } from './helpers/installDependencies'
import { validateNpmName } from './helpers/validateNpmPackage'
import prompts from 'prompts'
import { detectPackageManager, type PackageManagerName } from '@vxrn/utils'

const { existsSync, readFileSync, writeFileSync } = FSExtra

export async function create(args: { template?: string; name?: string }) {
  const gitVersionString = Number.parseFloat(
    execSync(`git --version`).toString().replace(`git version `, '').trim()
  )
  if (gitVersionString < 2.27) {
    console.error(`\n\n ! vxrn can't install: Git version must be >= 2.27\n\n`)
    process.exit(1)
  }

  let projectName = args.name || ''
  let resolvedProjectPath = path.resolve(process.cwd(), projectName)

  async function promptForName() {
    projectName = await getProjectName()
    resolvedProjectPath = path.resolve(process.cwd(), projectName)
  }

  if (projectName) {
    if (fs.existsSync(resolvedProjectPath)) {
      console.error(`Error: folder already exists: ${resolvedProjectPath}`)
      process.exit(1)
    }
  } else {
    await promptForName()

    while (fs.existsSync(resolvedProjectPath)) {
      console.info()
      console.info(
        ansis.yellow('!'),
        `The folder ${ansis.underline(
          ansis.blueBright(projectName)
        )} already exists, lets try another name`
      )
      console.info()
      console.info()
      await promptForName()
    }
  }

  // space
  console.info()

  let template = await getTemplateInfo(args.template)

  const { valid, problems } = validateNpmName(projectName)
  if (!valid) {
    console.error(
      `Could not create a project called ${ansis.red(
        `"${projectName}"`
      )} because of npm naming restrictions:`
    )

    problems!.forEach((p) => console.error(`    ${ansis.red.bold('*')} ${p}`))
    process.exit(1)
  }

  console.info()

  const Spinner = await import('yocto-spinner').then((x) => x.default)

  const spinner = Spinner({
    text: `Creating...`,
    spinner: {
      frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
      interval: 100,
    },
  }).start()

  await FSExtra.mkdir(resolvedProjectPath)

  try {
    await cloneStarter(template, resolvedProjectPath)
    process.chdir(resolvedProjectPath)
  } catch (e) {
    console.error(`[vxrn] Failed to copy example into ${resolvedProjectPath}\n\n`, e)
    process.exit(1)
  }

  spinner.stop()
  console.info()
  console.info()
  console.info(ansis.green(`${projectName} created!`))
  console.info()
  console.info()

  const packageJson = await (async () => {
    const errorMessages: string[] = []

    try {
      const dirname =
        typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

      // Test the paths to ensure they exist
      const possiblePaths = [
        path.join(dirname, '..', 'package.json'),
        path.join(dirname, '..', '..', 'package.json'),
        path.join(dirname, '..', '..', '..', 'package.json'),
      ]

      const readFile = promisify(fs.readFile)

      for (const p of possiblePaths) {
        try {
          const data = JSON.parse((await readFile(p)) as any)
          return data
        } catch (e) {
          if (e instanceof Error) errorMessages.push(e.message)
        }
      }

      throw new Error('package.json not found in any of the expected locations.')
    } catch (e) {
      console.error('Failed to load package.json:', errorMessages.join('\n'))
      throw e
    }
  })()

  // change root package.json's name to project name
  updatePackageJsonName(projectName, resolvedProjectPath)
  // replace `"workspace:*"` with the actual version
  updatePackageJsonVersions(packageJson.version, resolvedProjectPath)
  // change root app.json's name to project name
  updateAppJsonName(projectName, resolvedProjectPath)

  const packageManager: PackageManagerName = await (async () => {
    if ('packageManager' in template) {
      return template.packageManager
    }
    const found = await detectPackageManager()

    const allFound = Object.keys(found) as PackageManagerName[]

    if (allFound.length === 1) {
      return allFound[0]
    }

    const response = await prompts({
      name: 'packageManager',
      type: 'select',
      message: `Package Manager:`,
      choices: allFound
        .filter((x) => found[x])
        .map((name) => ({
          title: name,
          value: name,
        })),
    })

    return response.packageManager
  })()

  console.info()

  if ('preInstall' in template) {
    await template.preInstall({
      packageManager,
      isFullClone: true,
      projectName,
      projectPath: resolvedProjectPath,
    })
  }

  try {
    console.info()
    console.info(ansis.green(`Installing with ${packageManager}...`))
    console.info()
    await installDependencies(resolvedProjectPath, packageManager as any)
  } catch (e: any) {
    console.error('[vxrn] error installing with ' + packageManager + '\n' + `${e}`)
    process.exit(1)
  }

  // copy .env.default to .env
  const envDefault = path.join(resolvedProjectPath, '.env.default')
  const env = path.join(resolvedProjectPath, '.env')
  if (existsSync(envDefault) && !existsSync(env)) {
    await FSExtra.move(envDefault, env)
  }

  if ('extraSteps' in template) {
    await template.extraSteps({
      packageManager,
      isFullClone: true,
      projectName,
      projectPath: resolvedProjectPath,
    })
  }

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

function updatePackageJsonVersions(version: string, dir: string) {
  const packageJsonPath = path.join(dir, 'package.json')
  if (existsSync(packageJsonPath)) {
    const content = readFileSync(packageJsonPath).toString()
    // https://yarnpkg.com/features/workspaces#cross-references
    const contentWithUpdatedVersions = content
      .replace(/"workspace:\^"/gm, `"^${version}"`)
      .replace(/"workspace:~"/gm, `"~${version}"`)
      .replace(/"workspace:\*"/gm, `"${version}"`)
    writeFileSync(packageJsonPath, contentWithUpdatedVersions)
  }
}

function updateAppJsonName(projectName: string, dir: string) {
  const appJsonPath = path.join(dir, 'app.json')
  if (existsSync(appJsonPath)) {
    const content = readFileSync(appJsonPath).toString()
    const projectSlug = projectName.toLowerCase().replace(/\s/g, '-')
    const contentWithUpdatedName = content
      .replace(/("name": ")(.*)(",)/, `$1${projectName}$3`)
      .replace(/("slug": ")(.*)(",)/, `$1${projectSlug}$3`)
    writeFileSync(appJsonPath, contentWithUpdatedName)
  }
}
