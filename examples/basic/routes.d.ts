import type { VXSRouter } from 'one'

declare module 'one' {
  export namespace VXSRouter {
    export interface __routes<T extends string = string> extends Record<string, unknown> {
      StaticRoutes: `/` | `/(feed)` | `/(feed)/` | `/_sitemap` | `/notifications` | `/profile`
      DynamicRoutes: `/(feed)/post/${VXSRouter.SingleRoutePart<T>}` | `/post/${VXSRouter.SingleRoutePart<T>}`
      DynamicRouteTemplate: `/(feed)/post/[id]` | `/post/[id]`
      IsTyped: true
    }
  }
}