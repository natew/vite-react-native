import { getPathFromLoaderPath } from './cleanUrl'
import { LOADER_JS_POSTFIX_UNCACHED } from './constants'
import { RouteNode } from './Route'
import type { RouteInfo } from './server/createRoutesManifest'
import type { LoaderProps } from './types'
import { isResponse } from './utils/isResponse'
import { promiseWithResolvers } from './utils/promiseWithResolvers'
import { getManifest } from './vite/getManifest'
import { resolveAPIEndpoint, resolveResponse } from './vite/resolveResponse'
import type { One } from './vite/types'

type RequestHandlerProps<RouteExtraProps extends Object = {}> = {
  request: Request
  route: RouteInfo<string> & RouteExtraProps
  url: URL
  loaderProps?: LoaderProps
}

type RequestHandlerResponse = null | string | Response

export function createHandleRequest(
  options: One.PluginOptions,
  handlers: {
    handleSSR?: (props: RequestHandlerProps) => Promise<any>
    handleLoader?: (props: RequestHandlerProps) => Promise<any>
    handleAPI?: (props: RequestHandlerProps) => Promise<any>
    loadMiddleware?: (route: RouteNode) => Promise<any>
  }
) {
  const manifest = getManifest()
  if (!manifest) {
    throw new Error(`No routes manifest`)
  }

  const apiRoutesMap: Record<string, RouteInfo & { compiledRegex: RegExp }> =
    manifest.apiRoutes.reduce((acc, cur) => {
      acc[cur.page] = { ...cur, compiledRegex: new RegExp(cur.namedRegex) }
      return acc
    }, {})

  const apiRoutesList = Object.values(apiRoutesMap)

  // shouldn't be mapping back and forth...
  const pageRoutes = manifest.pageRoutes.map((route) => ({
    ...route,
    workingRegex: new RegExp(route.namedRegex),
  }))

  async function runMiddlewares(request: Request, route: RouteInfo) {
    console.log('run', route.middlewares)
    if (route.middlewares?.length) {
      const loader = handlers.loadMiddleware
      if (!loader) {
        throw new Error(`No middleware handler configured`)
      }
      for (const middleware of route.middlewares) {
        const exported = (await loader(middleware))?.default
        if (!exported) {
          console.warn(`No export from middleware: ${middleware.contextKey}`)
        }
        const response = exported(request)
        if (response) {
          return response
        }
      }
    }
    return null
  }

  return {
    manifest,
    handler: async function handleRequest(request: Request): Promise<RequestHandlerResponse> {
      const urlString = request.url || ''
      const url = new URL(
        urlString || '',
        request.headers.get('host') ? `http://${request.headers.get('host')}` : ''
      )
      const { pathname, search } = url

      if (pathname === '/__vxrnhmr' || pathname.startsWith('/@')) {
        return null
      }

      if (handlers.handleAPI) {
        const apiRoute = apiRoutesList.find((route) => {
          return route.compiledRegex.test(pathname)
        })

        if (apiRoute) {
          const params = getRouteParams(pathname, apiRoute)

          try {
            return resolveAPIEndpoint(
              await handlers.handleAPI({
                request,
                route: apiRoute,
                url,
                loaderProps: {
                  path: pathname,
                  params,
                },
              }),
              request,
              params || {}
            )
          } catch (err) {
            if (isResponse(err)) {
              return err
            }

            if (process.env.NODE_ENV === 'development') {
              console.error(`\n [one] Error importing API route at ${pathname}:

                ${err}
              
                If this is an import error, you can likely fix this by adding this dependency to
                the "optimizeDeps.include" array in your vite.config.ts.
              `)
            }

            throw err
          }
        }
      }

      if (request.method !== 'GET') {
        return null
      }

      if (handlers.handleLoader) {
        const isClientRequestingNewRoute = pathname.endsWith(LOADER_JS_POSTFIX_UNCACHED)

        if (isClientRequestingNewRoute) {
          const originalUrl = getPathFromLoaderPath(pathname)

          const finalUrl = new URL(originalUrl, url.origin)

          for (const route of pageRoutes) {
            if (route.file === '') {
              // ignore not found route
              // TODO improve/remove when not found is fixed
              continue
            }

            if (!route.workingRegex.test(finalUrl.pathname)) {
              continue
            }

            const middlewareResponse = await runMiddlewares(request, route)
            if (middlewareResponse) {
              return middlewareResponse
            }

            if (process.env.NODE_ENV === 'development') {
              console.info(` ❶ Running loader for route: ${finalUrl.pathname}`)
            }

            return await resolveResponse(async () => {
              const headers = new Headers()
              headers.set('Content-Type', 'text/javascript')

              try {
                const loaderResponse = await handlers.handleLoader!({
                  request,
                  route,
                  url,
                  loaderProps: {
                    path: finalUrl.pathname,
                    request: route.type === 'ssr' ? request : undefined,
                    params: getLoaderParams(finalUrl, route),
                  },
                })

                return new Response(loaderResponse, {
                  headers,
                })
              } catch (err) {
                // allow throwing a response in a loader
                if (isResponse(err)) {
                  return err
                }

                console.error(`Error running loader: ${err}`)

                throw err
              }
            })
          }

          if (process.env.NODE_ENV === 'development') {
            console.error(`No matching route found!`, {
              originalUrl,
              routes: manifest.pageRoutes,
            })
          }

          // error no match!

          return Response.error()
        }
      }

      if (handlers.handleSSR) {
        for (const route of pageRoutes) {
          if (!route.workingRegex.test(pathname)) {
            continue
          }

          const middlewareResponse = await runMiddlewares(request, route)
          if (middlewareResponse) {
            return middlewareResponse
          }

          return await resolveResponse(async () => {
            return await handlers.handleSSR!({
              request,
              route,
              url,
              loaderProps: {
                path: pathname + search,
                params: getLoaderParams(url, route),
              },
            })
          })
        }
      }

      return null
    },
  }
}

function getLoaderParams(
  url: URL,
  config: { workingRegex: RegExp; routeKeys: Record<string, string> }
) {
  const params: Record<string, string> = {}
  const match = new RegExp(config.workingRegex).exec(url.pathname)
  if (match?.groups) {
    for (const [key, value] of Object.entries(match.groups)) {
      const namedKey = config.routeKeys[key]
      params[namedKey] = value as string
    }
  }
  return params
}

// Add this helper function
function getRouteParams(pathname: string, route: RouteInfo<string>) {
  const regex = new RegExp(route.namedRegex)
  const match = regex.exec(pathname)
  if (!match) return {}
  return Object.fromEntries(
    Object.entries(route.routeKeys).map(([key, value]) => {
      return [value, (match.groups?.[key] || '') as string]
    })
  )
}
