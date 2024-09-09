import {
  type ColorSchemeName,
  setColorScheme,
  useColorScheme as useColorSchemeBase,
  useColorSchemeSetting,
} from '@vxrn/universal-color-scheme'
import { useIsomorphicLayoutEffect } from '@vxrn/use-isomorphic-layout-effect'
import { createContext, useContext, useMemo } from 'react'

export type Scheme = 'light' | 'dark'
export type SchemeSetting = 'system' | 'light' | 'dark'

export { getColorScheme, onColorSchemeChange } from '@vxrn/universal-color-scheme'

const storageKey = 'vxrn-scheme'

const getSetting = (): SchemeSetting =>
  (typeof localStorage !== 'undefined' && (localStorage.getItem(storageKey) as SchemeSetting)) ||
  'system'

// on startup lets set from localstorage
const setting = getSetting()

if (setting !== 'system') {
  setColorScheme(setting)
}

const SchemeContext = createContext<{
  setting: SchemeSetting
  scheme: 'light' | 'dark'
}>({
  setting: 'system',
  scheme: 'light',
})

export const useColorScheme = () => {
  const [state] = useColorSchemeBase()
  return [state, setSchemeSetting] as const
}

export function useSchemeSetting() {
  const values = useContext(SchemeContext)
  return [values, setSchemeSetting] as const
}

export function setSchemeSetting(next: SchemeSetting) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(storageKey, next)
  }
  setColorScheme(next)
}

export function SchemeProvider({
  children,
  // defaults to tamagui-compatible
  getClassName = (name) => `t_${name}`,
}: { children: any; getClassName?: (name: ColorSchemeName) => string }) {
  const [colorSchemeSetting] = useColorSchemeSetting()
  const [colorScheme] = useColorScheme()

  if (process.env.TAMAGUI_TARGET !== 'native') {
    useIsomorphicLayoutEffect(() => {
      const toAdd = getClassName(colorScheme)
      const { classList } = document.documentElement
      if (!classList.contains(toAdd)) {
        const toRemove = colorScheme === 'light' ? 'dark' : 'light'
        classList.remove(getClassName(toRemove))
        classList.add(toAdd)
      }
    }, [colorScheme])
  }

  return (
    <>
      {process.env.TAMAGUI_TARGET === 'native' ? null : (
        <script
          dangerouslySetInnerHTML={{
            __html: `let d = document.documentElement.classList
          d.remove('${getClassName('light')}')
            d.remove('${getClassName('dark')}')
          let e = localStorage.getItem('${storageKey}')
          let t =
            'system' === e || !e
              ? window.matchMedia('(prefers-color-scheme: dark)').matches
              : e === 'dark'
          t ? d.add('${getClassName('dark')}') : d.add('${getClassName('light')}')
          `,
          }}
        />
      )}
      <SchemeContext.Provider
        value={useMemo(
          () => ({
            scheme: colorScheme,
            setting: colorSchemeSetting,
          }),
          [colorScheme, colorSchemeSetting]
        )}
      >
        {children}
      </SchemeContext.Provider>
    </>
  )
}
