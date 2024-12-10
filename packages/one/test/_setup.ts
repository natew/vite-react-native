import getPort from 'get-port'
import { exec, spawn, type ChildProcess } from 'node:child_process'
import * as path from 'node:path'
import { ONLY_TEST_DEV } from './_constants'

export type TestInfo = {
  testDir: string
  testProdPort: number
  testDevPort: number
  devServerPid: number
  prodServerPid: number
  buildPid: number // Add this line
}

const waitForServer = (
  url: string,
  { maxRetries = 30, retryInterval = 1000, getServerOutput = () => '' }
): Promise<void> => {
  const startedAt = performance.now()
  return new Promise((resolve, reject) => {
    let retries = 0
    const checkServer = async () => {
      try {
        const response = await fetch(url)
        if (response.ok) {
          console.info(
            `Server at ${url} is ready after ${Math.round(performance.now() - startedAt)}ms`
          )
          resolve()
        } else {
          throw new Error('Server not ready')
        }
      } catch (error) {
        if (retries >= maxRetries) {
          reject(
            new Error(
              `Server at ${url} did not start within the expected time (timeout after waiting for ${Math.round(performance.now() - startedAt)}ms).\nLogs:\n${getServerOutput()}`
            )
          )
        } else {
          retries++
          setTimeout(checkServer, retryInterval)
        }
      }
    }
    checkServer()
  })
}

export default async () => {
  const fixtureDir = path.join(__dirname, '../../../tests/test')

  console.info('Setting up tests 🛠️')
  console.info(`Using fixture directory: ${fixtureDir}`)

  let prodServer: ChildProcess | null = null
  let devServer: ChildProcess | null = null
  let buildProcess: ChildProcess | null = null // Add this line

  // Get available ports
  const prodPort = await getPort()
  const devPort = await getPort()

  try {
    if (!ONLY_TEST_DEV) {
      // Run prod build using spawn
      console.info('Starting a prod build.')
      const prodBuildStartedAt = performance.now()
      buildProcess = spawn('yarn', ['build:web'], {
        cwd: fixtureDir,
        env: {
          ...process.env,
          ONE_SERVER_URL: `http://localhost:${prodPort}`,
        },
      })
      let buildProcessOutput = ''
      buildProcess.stdout?.on('data', (data) => {
        buildProcessOutput += data.toString()
      })
      buildProcess.stderr?.on('data', (data) => {
        buildProcessOutput += data.toString()
      })

      // Wait for build process to complete
      await new Promise<void>((resolve, reject) => {
        buildProcess!.once('exit', (code) => {
          if (code === 0) {
            console.info(
              `Prod build completed successfully after ${Math.round(performance.now() - prodBuildStartedAt)}ms`
            )
            resolve()
          } else {
            reject(
              new Error(
                `Build process exited with code ${code} after ${Math.round(performance.now() - prodBuildStartedAt)}ms.\nLogs:\n${buildProcessOutput}`
              )
            )
          }
        })

        buildProcess!.on('error', reject)
      })
    }

    // No need to kill the build process here, as it should have completed

    // Start dev server
    console.info(`Starting a dev server on http://localhost:${devPort}`)
    devServer = exec(`yarn dev --port ${devPort}`, {
      cwd: fixtureDir,
      env: { ...process.env },
    })
    let devServerOutput = ''
    devServer.stdout?.on('data', (data) => {
      devServerOutput += data.toString()
    })
    devServer.stderr?.on('data', (data) => {
      devServerOutput += data.toString()
    })

    // Start prod server
    let prodServerOutput = ''

    if (!ONLY_TEST_DEV) {
      console.info(`Starting a prod server on http://localhost:${prodPort}`)
      prodServer = exec(`yarn serve --port ${prodPort}`, {
        cwd: fixtureDir,
        env: {
          ...process.env,
          ONE_SERVER_URL: `http://localhost:${prodPort}`,
        },
      })
      prodServer.stdout?.on('data', (data) => {
        prodServerOutput += data.toString()
      })
      prodServer.stderr?.on('data', (data) => {
        prodServerOutput += data.toString()
      })
    }

    // Wait for both servers to be ready
    await Promise.all([
      waitForServer(`http://localhost:${devPort}`, { getServerOutput: () => devServerOutput }),
      ONLY_TEST_DEV
        ? null
        : waitForServer(`http://localhost:${prodPort}`, {
            getServerOutput: () => prodServerOutput,
          }),
    ])

    console.info('Servers are running.🎉 \n')

    // Attach information to globalThis
    const testInfo = {
      testDir: fixtureDir,
      testProdPort: prodPort,
      testDevPort: devPort,
      devServerPid: devServer?.pid,
      prodServerPid: prodServer?.pid,
      buildPid: null, // Set to null as the build process should have completed
    }

    return testInfo
  } catch (error) {
    devServer?.kill()
    prodServer?.kill()
    // No need to kill buildProcess here as it should have completed or failed
    console.error('Setup error:', error)
    throw error
  }
}
