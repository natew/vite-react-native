import type { SimpleDepPatchObject } from 'vxrn'
import { loadUserOneOptions } from '../vite/loadConfig'

export async function run(args: {}) {
  const { patch } = await import('vxrn')

  const options = await loadUserOneOptions('build')

  await patch({
    root: process.cwd(),
    deps: options.oneOptions.deps as SimpleDepPatchObject,
  })
}
