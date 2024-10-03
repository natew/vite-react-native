import { getPort } from 'get-port-please'
import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { readPackageJSON } from 'pkg-types'
import type { VXRNOptions } from '../types'
import { readState, writeState } from './state'

const require = createRequire(import.meta.url)

export type VXRNOptionsFilled = Awaited<ReturnType<typeof fillOptions>>

let optionsFilled: VXRNOptionsFilled | null = null

export async function fillOptions(
  options: VXRNOptions,
  internal: { mode?: 'dev' | 'prod' } = { mode: 'dev' }
) {
  const { root = process.cwd(), server = {}, entries } = options
  const {
    host = '0.0.0.0' /* TODO: Better default to 127.0.0.1 due to security reasons, and only dynamically change to 0.0.0.0 if the user is requesting an Expo QR code */,
    https,
  } = server

  const defaultPort = server.port || (internal.mode === 'dev' ? 8081 : 3000)
  const packageRootDir = join(require.resolve('vxrn'), '../..')
  const cacheDir = join(root, 'node_modules', '.vxrn')

  const [port, state, packageJSON] = await Promise.all([
    getPort({
      port: defaultPort,
      portRange: [defaultPort, defaultPort + 100],
      host: '127.0.0.1',
    }),
    readState(cacheDir),
    readPackageJSON(),
  ])

  const deps = packageJSON.dependencies || {}

  const packageVersions =
    deps.react && deps['react-native']
      ? {
          react: deps.react.replace(/[\^\~]/, ''),
          reactNative: deps['react-native'].replace(/[\^\~]/, ''),
        }
      : undefined

  const versionHash = hashString(JSON.stringify(packageJSON))
  const clean = Boolean(options.clean ?? (state.versionHash && state.versionHash !== versionHash))

  // no need to wait to write state
  void writeState(cacheDir, { versionHash })

  if (typeof options.build?.server !== 'boolean' && !options.build?.server) {
    // default building server to off
    options.build ||= {}
    options.build.server = false
  }

  const protocol = https ? ('https:' as const) : ('http:' as const)

  const final = {
    ...options,
    clean,
    root,
    server: {
      ...options.server,
      port,
      host,
      protocol,
      url: `${protocol}//${host}:${port}`,
    },
    entries: {
      native: './src/entry-native.tsx',
      server: './src/entry-server.tsx',
      ...entries,
    },
    packageJSON,
    packageVersions,
    state,
    packageRootDir,
    cacheDir,
  }

  optionsFilled = final

  return final
}

export function getOptionsFilled() {
  return optionsFilled
}

function hashString(str: string): string {
  const hash = createHash('sha256') // Create a hash object with the desired algorithm (e.g., 'sha256')
  hash.update(str) // Update the hash content with the input string
  return hash.digest('hex') // Output the final hash in hexadecimal format
}
