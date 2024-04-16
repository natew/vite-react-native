import { ExpoRoot } from '@vxrn/expo-router'

import { Suspense } from 'react'
import { useRoutes } from './hooks/useRoutes'

// @ts-ignore
export const routes = import.meta.glob('../app/**/*.tsx')

export function App({ path }: { path?: string }) {
  return (
    // ⚠️ <StrictMode> breaks expo router!
    <>
      <Suspense fallback={null}>
        <Router path={path} />
      </Suspense>
    </>
  )
}

function Router({ path }: { path?: string }) {
  // idk why this fixes error logging
  return <Test path={path} />
}

function Test({ path }: { path?: string }) {
  const context = useRoutes(routes)

  return (
    <ExpoRoot
      location={path ? new URL(`http://localhost:3333${path}`) : undefined}
      context={context}
    />
  )
}
