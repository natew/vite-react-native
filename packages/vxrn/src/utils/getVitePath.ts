import { dirname, join, relative } from 'node:path'

import FSExtra from 'fs-extra'

export async function getVitePath(
  rootPath: string,
  importer: string,
  moduleName: string,
  resolver: (moduleName: string, importer: string) => Promise<string>,
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
  if (moduleName.includes('one/dist/esm/index')) {
    return 'one'
  }

  if (moduleName[0] === '.') {
    const rootAt = importer.indexOf(rootPath)
    const base = join(dirname(importer.slice(rootAt)), moduleName)
    return base + '.js'
  }
  if (moduleName === 'vxs') {
    // TODO hardcoded
    return 'vxs'
  }

  const sourceFile = join(process.cwd(), 'index.js')
  const resolved = await resolver(moduleName, sourceFile)

  // TODO
  if (!resolved) {
    return 'one'
  }

  // figure out symlinks
  if (!resolved) {
    throw new Error(
      ` ❌ Path not found ${sourceFile} (rootPath ${rootPath}, importer ${importer}, moduleName ${moduleName})`
    )
  }

  const real = await FSExtra.realpath(resolved)

  let id = real

  // if (!absolute) {
  //   id = relative(importer, real)
  // }

  if (id.endsWith(`/react/jsx-dev-runtime.js`)) {
    id = 'react/jsx-runtime'
  }

  return id
}
