import { Root } from './Root'
import { resolveClientLoader } from './clientLoaderResolver'
import { render } from './render'
import { renderToString } from './server-render'
import type { RenderAppProps } from './types'

export type CreateAppProps = { routes: Record<string, () => Promise<unknown>> }

export function createApp(options: CreateAppProps): void {
  if (import.meta.env.SSR) {
    // @ts-expect-error
    // biome-ignore lint/correctness/noVoidTypeReturn: this is a public api but ssr called only internally
    return {
      options,
      render: async (props: RenderAppProps) => {
        await resolveClientLoader(props)
        return await renderToString(<Root routes={options.routes} {...props} />, {
          preloads: props.preloads,
        })
      },
    }
  }

  // on client we just render
  render(<Root isClient routes={options.routes} path={window.location.href} />)
}
