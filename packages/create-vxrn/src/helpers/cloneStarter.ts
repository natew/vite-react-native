import { execSync } from 'node:child_process'
import { homedir } from 'node:os'
import { join } from 'node:path'

import chalk from 'chalk'
import { copy, ensureDir, pathExists, remove } from 'fs-extra'
import { rimraf } from 'rimraf'
import { $, cd } from 'zx'

import type { templates } from '../templates'

const exec = (cmd: string, options?: Parameters<typeof execSync>[1]) => {
  return execSync(cmd, {
    stdio: process.env.DEBUG ? 'inherit' : 'ignore',
    ...options,
  })
}

const home = homedir()
const vxrnDir = join(home, '.vxrn')
let targetGitDir = ''

export const cloneStarter = async (
  template: (typeof templates)[number],
  resolvedProjectPath: string,
  projectName: string
) => {
  targetGitDir = join(vxrnDir, 'vxrn', template.repo.url.split('/').at(-1)!)

  console.info()
  await setupVxrnDotDir(template)
  const starterDir = join(targetGitDir, ...template.repo.dir)
  console.info()
  console.info(`Copying starter from ${starterDir} into ${chalk.blueBright(projectName)}...`)
  console.info()

  // if (!(await pathExists(starterDir))) {
  //   console.error(`Missing template for ${template.value} in ${starterDir}`)
  //   process.exit(1)
  // }
  await copy(starterDir, resolvedProjectPath)
  await rimraf(`${resolvedProjectPath}/.git`)

  console.info(chalk.green(`${projectName} created!`))
  console.info()
}

async function setupVxrnDotDir(template: (typeof templates)[number], isRetry = false) {
  const repoRoot = join(__dirname, '..', '..', '..')

  console.info(`Setting up ${chalk.blueBright(targetGitDir)}...`)

  if (process.env.GITHUB_HEAD_REF) {
    try {
      await $`git switch -c ${process.env.GITHUB_HEAD_REF}`
    } catch {
      // re-tries branch already exists
    }
  }

  const branch = template.repo.branch

  await ensureDir(vxrnDir)
  cd(vxrnDir)

  const isInSubDir = template.repo.dir.length > 0

  if (!(await pathExists(targetGitDir))) {
    console.info(`Cloning vxrn base directory`)
    console.info()

    const sourceGitRepo = template.repo.url
    const sourceGitRepoSshFallback = template.repo.sshFallback

    const cmd = `git clone --branch ${branch} ${
      isInSubDir ? '--depth 1 --sparse --filter=blob:none ' : ''
    }${sourceGitRepo} "${targetGitDir}"`

    try {
      console.info(`$ ${cmd}`)
      console.info()
      exec(cmd)
    } catch (error) {
      if (cmd.includes('https://')) {
        console.info(`https failed - trying with ssh now...`)
        const sshCmd = cmd.replace(sourceGitRepo, sourceGitRepoSshFallback)
        console.info(`$ ${sshCmd}`)
        console.info()
        exec(sshCmd)
      } else {
        throw error
      }
    }
  } else {
    if (!(await pathExists(join(targetGitDir, '.git')))) {
      console.error(`Corrupt Vxrn directory, please delete ${targetGitDir} and re-run`)
      process.exit(1)
    }
  }

  if (isInSubDir) {
    const cmd = `git sparse-checkout set ${template.repo.dir[0] ?? '.'}`
    exec(cmd, { cwd: targetGitDir })
    console.info()
  }
  try {
    const cmd2 = `git pull --rebase --allow-unrelated-histories --depth 1 origin ${branch}`
    exec(cmd2, {
      cwd: targetGitDir,
    })
    console.info()
  } catch (err: any) {
    console.info(
      `Error updating: ${err.message} ${isRetry ? `failing.\n${err.stack}` : 'trying from fresh.'}`
    )
    if (isRetry) {
      console.info(
        `Please file an issue: https://github.com/vxrn/vxrn/issues/new?assignees=&labels=&template=bug_report.md&title=`
      )
      process.exit(1)
    }
    await remove(targetGitDir)
    await setupVxrnDotDir(template, true)
  }
}
