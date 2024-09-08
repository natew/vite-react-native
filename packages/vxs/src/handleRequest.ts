import type { RouteInfo } from './server/createRoutesManifest'
import { promiseWithResolvers } from './utils/promiseWithResolvers'
import { getManifest } from './vite/getManifest'
import type { VXS } from './vite/types'

type RequestHandlerProps<RouteExtraProps extends Object = {}> = {
  request: Request
  route: RouteInfo<string> & RouteExtraProps
  url: URL
  loaderProps?: { path: string; params: Record<string, any> }
}

type RequestHandlerResponse = null | string | Response

export function createHandleRequest(
  options: VXS.PluginOptions,
  handlers: {
    handleSSR?: (props: RequestHandlerProps<{ routeType: 'ssg' | 'spa' }>) => Promise<any>
    handleLoader?: (props: RequestHandlerProps) => Promise<any>
    handleAPI?: (props: RequestHandlerProps) => Promise<any>
  }
) {
  const { shouldIgnore, disableSSR } = options

  if (import.meta.env) {
    throw new Error(`No import.meta.env - Node 22 or greater required.`)
  }

  const manifest = getManifest('app')
  if (!manifest) {
    throw new Error(`No routes manifest`)
  }

  const apiRoutesMap = manifest.apiRoutes.reduce((acc, cur) => {
    acc[cur.page] = cur
    return acc
  }, {})

  // its really common for people to hit refresh a couple times even on accident
  // sending two ssr requests at once and causing slowdown.
  // use this to avoid
  const activeRequests = {}

  // shouldn't be mapping back and forth...
  const ssgRoutes = manifest.ssgRoutes.map((route) => ({
    ...route,
    routeType: 'ssg' as const,
    workingRegex: new RegExp(route.namedRegex),
  }))

  const spaRoutes = manifest.spaRoutes.map((route) => ({
    ...route,
    routeType: 'spa' as const,
    workingRegex: new RegExp(route.namedRegex),
  }))

  const routesWithRegex = [...ssgRoutes, ...spaRoutes]

  return async function handleRequest(request: Request): Promise<RequestHandlerResponse> {
    if (shouldIgnore?.(request)) {
      return null
    }

    const urlString = request.url || ''
    const url = new URL(
      urlString || '',
      request.headers.get('host') ? `http://${request.headers.get('host')}` : ''
    )
    const { pathname, search } = url

    if (process.env.NODE_ENV !== 'production') {
      if (activeRequests[pathname]) {
        return await activeRequests[pathname]
      }
    }

    if (handlers.handleAPI) {
      const apiRoute = apiRoutesMap[pathname]
      if (apiRoute) {
        return await handlers.handleAPI({ request, route: apiRoute, url })
      }
    }

    if (request.method !== 'GET' || pathname === '/__vxrnhmr' || pathname.startsWith('/@')) {
      return null
    }

    if (handlers.handleLoader) {
      const isClientRequestingNewRoute = pathname.endsWith('_vxrn_loader.js')

      if (isClientRequestingNewRoute) {
        const originalUrl = pathname.replace('_vxrn_loader.js', '')
        const finalUrl = new URL(originalUrl, url.origin)

        for (const route of routesWithRegex) {
          if (!route.workingRegex.test(finalUrl.pathname)) {
            continue
          }

          // TODO i think SPA routes should preload loader data just like ssg rather than return null here
          // if (route.routeType === 'spa') {
          //   return new Response(
          //     `
          //     export default () => null
          //     export const loader = () => null
          //     `,
          //     {
          //       headers: {
          //         'content-type': 'text/javascript',
          //       },
          //     }
          //   )
          // }

          const headers = new Headers()
          headers.set('Content-Type', 'text/javascript')

          const loaderResponse = await handlers.handleLoader({
            request,
            route,
            url,
            loaderProps: {
              path: finalUrl.pathname,
              params: getLoaderParams(finalUrl, route),
            },
          })

          return new Response(loaderResponse, {
            headers,
          })
        }

        if (process.env.NODE_ENV === 'development') {
          console.error(`No matching route found!`, {
            originalUrl,
            ssgRoutes: manifest.ssgRoutes,
            spaRoutes: manifest.spaRoutes,
          })
        }

        // error no match!

        return Response.error()
      }
    }

    if (handlers.handleSSR) {
      const { promise, reject, resolve } = promiseWithResolvers()
      activeRequests[pathname] = promise

      try {
        for (const route of routesWithRegex) {
          if (!route.workingRegex.test(pathname)) {
            continue
          }

          const ssrResponse = await handlers.handleSSR({
            request,
            route,
            url,
            loaderProps: {
              path: pathname + search,
              params: getLoaderParams(url, route),
            },
          })

          resolve(ssrResponse)
          return ssrResponse
        }
      } catch (err) {
        reject(err)
        throw err
      } finally {
        delete activeRequests[pathname]
      }
    }

    return null
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
