/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useRef } from 'react'
import { weakKey } from './utils/weakKey'
import { preloadingLoader } from './router/router'
import { CACHE_KEY, CLIENT_BASE_URL } from './router/constants'
import { useActiveParams, useParams, usePathname } from './hooks'
import { dynamicImport } from './utils/dynamicImport'
import { getDevServerUrl } from './getDevServerUrl'
import { useRouteNode } from './Route'
import { resolveHref } from './link/href'

const promises: Record<string, undefined | Promise<void>> = {}
const errors = {}
const loadedData: Record<string, any> = {}

export function useLoader<
  Loader extends Function,
  Returned = Loader extends (p: any) => any ? ReturnType<Loader> : unknown,
>(loader: Loader): Returned extends Promise<any> ? Awaited<Returned> : Returned {
  // server side we just run the loader directly
  if (typeof window === 'undefined') {
    return useAsyncFn(
      loader,
      globalThis['__vxrnLoaderProps__'] || {
        params: useActiveParams(),
      }
    )
  }

  const preloadedData = globalThis['__vxrnLoaderData__']
  const currentData = useRef(preloadedData)

  const isNative = process.env.TAMAGUI_TARGET === 'native'
  const routeNode = useRouteNode()
  const params = useParams()
  // Cannot use usePathname() here since it will change every time the route changes,
  // but here here we want to get the current local pathname which renders this screen.
  const pathName =
    '/' + resolveHref({ pathname: routeNode?.route || '', params }).replace(/index$/, '')
  const currentPath =
    (isNative ? null : globalThis['__vxrntodopath']) || // @zetavg: not sure why we're using `globalThis['__vxrntodopath']` here, but this breaks native when switching between tabs where the value stays with the previous path, so ignoring this on native
    // TODO likely either not needed or needs proper path from server side
    (typeof window !== 'undefined' ? window.location?.pathname || pathName : '/')

  useEffect(() => {
    if (preloadedData) {
      loadedData[currentPath] = preloadedData
      delete globalThis['__vxrnLoaderData__']
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preloadedData])

  if (errors[currentPath]) {
    throw errors[currentPath]
  }

  const loaded = loadedData[currentPath]
  if (typeof loaded !== 'undefined') {
    return loaded
  }

  if (!preloadedData) {
    if (preloadingLoader[currentPath]) {
      if (typeof preloadingLoader[currentPath] === 'function') {
        preloadingLoader[currentPath] = preloadingLoader[currentPath]()
      }
      promises[currentPath] = preloadingLoader[currentPath]
        .then((val) => {
          loadedData[currentPath] = val
        })
        .catch((err) => {
          console.error(`Error loading loader`, err)
          errors[currentPath] = err
          delete promises[currentPath]
          delete preloadingLoader[currentPath]
        })
    }

    if (!promises[currentPath]) {
      const getData = async () => {
        const loaderJSUrl = `${getDevServerUrl() /* TODO: production? */}${currentPath}_vxrn_loader.js?${CACHE_KEY}`

        try {
          const response = await (async () => {
            if (isNative) {
              const nativeLoaderJSUrl = `${loaderJSUrl}&platform=ios` /* TODO: platform */

              try {
                // On native, we need to fetch the loader code and eval it
                const loaderJsCodeResp = await fetch(nativeLoaderJSUrl)
                if (!loaderJsCodeResp.ok) {
                  throw new Error(`Response not ok: ${loaderJsCodeResp.status}`)
                }
                const loaderJsCode = await loaderJsCodeResp.text()
                // biome-ignore lint/security/noGlobalEval: we can't use dynamic `import` on native so we need to fetch and `eval` the code
                const result = eval(
                  `() => { var exports = {}; ${loaderJsCode}; return exports; }`
                )()

                if (typeof result.loader !== 'function') {
                  throw new Error("Loader code isn't exporting a `loader` function")
                }

                return result
              } catch (e) {
                console.error(`Error fetching loader from URL: ${nativeLoaderJSUrl}, ${e}`)
                return { loader: () => ({}) }
              }
            }

            // On web, we can use import to dynamically load the loader
            return await dynamicImport(loaderJSUrl)
          })()

          loadedData[currentPath] = response.loader()
          return loadedData[currentPath]
        } catch (err) {
          console.error(`Error calling loader: ${err}`)
          errors[currentPath] = err
          delete promises[currentPath]
          return null
        }
      }
      promises[currentPath] = getData()
    }

    throw promises[currentPath]
  }

  return currentData.current
}

export type LoaderProps<Params extends Object = Record<string, string>> = {
  path: string
  params: Params
}

const results = new Map()
const started = new Map()

function useAsyncFn(val: any, props?: any) {
  const key = (val ? weakKey(val) : '') + JSON.stringify(props)

  if (val) {
    if (!started.get(key)) {
      started.set(key, true)

      let next = val(props)
      if (next instanceof Promise) {
        next = next
          .then((final) => {
            results.set(key, final)
          })
          .catch((err) => {
            console.error(`Error running loader()`, err)
            results.set(key, undefined)
          })
      }
      results.set(key, next)
    }
  }

  const current = results.get(key)

  if (current instanceof Promise) {
    throw current
  }

  return current
}
