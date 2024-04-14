import { join, relative, dirname } from 'node:path'

import resolve from 'esm-resolve'
import FSExtra from 'fs-extra'

export async function getVitePath(
  rootPath: string,
  importer: string,
  moduleName: string,
  absolute = false
) {
  // our virtual modules
  if (moduleName === 'react-native') {
    return 'react-native'
  }
  if (moduleName === 'react') {
    return 'react'
  }
  if (moduleName === 'react/jsx-runtime') {
    return 'react/jsx-runtime'
  }
  if (moduleName === 'react/jsx-dev-runtime') {
    return 'react/jsx-dev-runtime'
  }

  if (moduleName[0] === '.') {
    const rootAt = importer.indexOf(rootPath)
    const base = join(dirname(importer.slice(rootAt)), moduleName)
    return base + '.js'
  }

  const sourceFile = join(process.cwd(), 'index.js')
  const resolved = resolve(sourceFile)(moduleName)
  // figure out symlinks
  if (!resolved) {
    throw new Error(`❌ cant find`)
  }
  const real = await FSExtra.realpath(resolved)
  let id = real
  if (!absolute) {
    id = relative(importer, real)
  }
  if (id.endsWith(`/react/jsx-dev-runtime.js`)) {
    id = 'react/jsx-runtime'
  }
  return id
}
