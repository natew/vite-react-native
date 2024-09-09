import { copy, ensureDir, move, pathExists, remove } from 'fs-extra'
import { homedir } from 'node:os'
import { join, sep } from 'node:path'
import { rimraf } from 'rimraf'
import type { templates } from '../templates'
import { execPromiseQuiet } from './exec'

const home = homedir()
const vxrnDir = join(home, '.vxrn')
let targetGitDir = ''

export const cloneStarter = async (
  template: (typeof templates)[number],
  resolvedProjectPath: string,
  projectName: string
) => {
  targetGitDir = join(vxrnDir, 'vxrn', template.repo.url.split('/').at(-1)!)

  if (!process.env.VXRN_DEMO_MODE) {
    await setupVxrnDotDir(template)
  }

  const dir = process.env.VXRN_DEMO_MODE
    ? join(home, 'vxrn', 'examples', 'basic')
    : join(targetGitDir, ...template.repo.dir)

  if (!(await pathExists(dir))) {
    console.error(`Missing template for ${template.value} in ${dir}`)
    process.exit(1)
  }

  await copy(dir, resolvedProjectPath)

  // reset git
  await rimraf(join(resolvedProjectPath, '.git'))
  await execPromiseQuiet(`git init`, {
    cwd: resolvedProjectPath,
  })

  const yarnLockDefault = join(resolvedProjectPath, 'yarn.lock.default')
  if (await pathExists(yarnLockDefault)) {
    await move(yarnLockDefault, join(resolvedProjectPath, 'yarn.lock'))
  }
}

async function setupVxrnDotDir(template: (typeof templates)[number], isRetry = false) {
  const branch = template.repo.branch

  await ensureDir(vxrnDir)

  const isInSubDir = template.repo.dir.length > 0

  if (!(await pathExists(targetGitDir))) {
    const sourceGitRepo = template.repo.url
    const sourceGitRepoSshFallback = template.repo.sshFallback

    const cmd = `git clone --branch ${branch} ${
      isInSubDir ? '--depth 1 --sparse --filter=blob:none ' : ''
    }${sourceGitRepo} "${targetGitDir}"`

    try {
      await execPromiseQuiet(cmd)
    } catch (error) {
      if (cmd.includes('https://')) {
        console.info(`https failed - trying with ssh now...`)
        const sshCmd = cmd.replace(sourceGitRepo, sourceGitRepoSshFallback)
        await execPromiseQuiet(sshCmd)
      } else {
        throw error
      }
    }
  } else {
    if (!(await pathExists(join(targetGitDir, '.git')))) {
      console.error(`Corrupt vxrn directory, please delete ${targetGitDir} folder and re-run`)
      process.exit(1)
    }
  }

  if (isInSubDir) {
    const cmd = `git sparse-checkout set ${template.repo.dir.join(sep) ?? '.'}`
    await execPromiseQuiet(cmd, { cwd: targetGitDir })
  }

  try {
    const cmd2 = `git pull --rebase --allow-unrelated-histories --depth 1 origin ${branch}`
    await execPromiseQuiet(cmd2, {
      cwd: targetGitDir,
    })
    console.info()
  } catch (err: any) {
    if (isRetry) {
      console.info(
        `Error updating: ${err.message} ${isRetry ? `failing.\n${err.stack}` : 'trying from fresh.'}`
      )
      console.info(
        `Please file an issue: https://github.com/universal-future/vxrn/issues/new?assignees=&labels=&template=bug_report.md&title=`
      )
      process.exit(1)
    }
    await remove(targetGitDir)
    await setupVxrnDotDir(template, true)
  }
}
