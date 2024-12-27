import { gray, grayDark } from '@tamagui/colors'
import { objectFromEntries, objectKeys, postfixObjKeys } from '../helpers/typeHelpers'

const yellow = {
  yellow1: 'hsl(54, 24.0%, 95.5%)',
  yellow2: 'hsl(54, 30%, 93.5%)',
  yellow3: 'hsl(54, 40%, 88.9%)',
  yellow4: 'hsl(54, 40%, 83.6%)',
  yellow5: 'hsl(54, 47.9%, 78.0%)',
  yellow6: 'hsl(54, 49.4%, 72.1%)',
  yellow7: 'hsl(54, 50.4%, 65.0%)',
  yellow8: 'hsl(54, 90%, 62%)',
  yellow9: 'hsl(54, 80%, 58.0%)',
  yellow10: 'hsl(54, 50%, 40%)',
  yellow11: 'hsl(54, 40%, 30.0%)',
  yellow12: 'hsl(54, 35.0%, 15%)',
  yellow13: '#000',
}

const yellowDark = {
  yellow1: 'hsl(54, 10%, 6.5%)',
  yellow2: 'hsl(54, 10%, 10.7%)',
  yellow3: 'hsl(54, 10%, 14.7%)',
  yellow4: 'hsl(54, 20%, 16.4%)',
  yellow5: 'hsl(54, 20%, 18.1%)',
  yellow6: 'hsl(54, 20%, 20.3%)',
  yellow7: 'hsl(54, 30%, 22.4%)',
  yellow8: 'hsl(54, 60%, 25.0%)',
  yellow9: 'hsl(54, 92.0%, 40.0%)',
  yellow10: 'hsl(54, 100%, 60.0%)',
  yellow11: 'hsl(54, 80%, 80.0%)',
  yellow12: 'hsl(54, 50%, 91.0%)',
  yellow13: '#fff',
}

const colorTokens = {
  light: {
    yellow,
    gray,
  },
  dark: {
    yellow: yellowDark,
    gray: grayDark,
  },
}

export const lightShadowColor = 'rgba(0,0,0,0.05)'
export const lightShadowColorStrong = 'rgba(0,0,0,0.1)'
export const darkShadowColor = 'rgba(0,0,0,0.12)'
export const darkShadowColorStrong = 'rgba(0,0,0,0.2)'

export const darkColors = {
  ...colorTokens.dark.yellow,
  ...colorTokens.dark.gray,

  blue: 'hsla(210, 60%, 40%, 1)',
  green: 'hsla(120, 60%, 40%, 1)',
  red: 'hsla(0, 60%, 40%, 1)',
  purple: 'hsla(270, 60%, 40%, 1)',
  pink: 'hsla(330, 60%, 40%, 1)',

  blueFg: 'hsl(210, 60%, 90%)',
  greenFg: 'hsl(120, 60%, 90%)',
  redFg: 'hsl(0, 60%, 90%)',
  purpleFg: 'hsl(270, 60%, 90%)',
  pinkFg: 'hsl(330, 60%, 90%)',
}

export const lightColors = {
  ...colorTokens.light.yellow,
  ...colorTokens.light.gray,

  blue: 'hsla(210, 60%, 80%)',
  green: 'hsla(120, 60%, 80%)',
  red: 'hsla(0, 60%, 80%)',
  purple: 'hsla(270, 60%, 80%)',
  pink: 'hsla(330, 60%, 80%)',

  blueFg: 'hsl(210, 60%, 10%)',
  greenFg: 'hsl(120, 60%, 10%)',
  redFg: 'hsl(0, 60%, 10%)',
  purpleFg: 'hsl(270, 60%, 10%)',
  pinkFg: 'hsl(330, 60%, 10%)',
}

export const color = {
  white0: 'rgba(255,255,255,0)',
  white075: 'rgba(255,255,255,0.75)',
  white05: 'rgba(255,255,255,0.5)',
  white025: 'rgba(255,255,255,0.25)',
  black0: 'rgba(10,10,10,0)',
  black075: 'rgba(10,10,10,0.75)',
  black05: 'rgba(10,10,10,0.5)',
  black025: 'rgba(10,10,10,0.25)',
  white1: '#D1CDC2',
  white2: '#f8f8f8',
  white3: 'hsl(0, 0%, 96.3%)',
  white4: 'hsl(0, 0%, 94.1%)',
  white5: 'hsl(0, 0%, 92.0%)',
  white6: 'hsl(0, 0%, 90.0%)',
  white7: 'hsl(0, 0%, 88.5%)',
  white8: 'hsl(0, 0%, 81.0%)',
  white9: 'hsl(0, 0%, 56.1%)',
  white10: 'hsl(0, 0%, 50.3%)',
  white11: 'hsl(0, 0%, 42.5%)',
  white12: 'hsl(0, 0%, 9.0%)',
  black1: '#050505',
  black2: '#151515',
  black3: '#191919',
  black4: '#232323',
  black5: '#282828',
  black6: '#323232',
  black7: '#424242',
  black8: '#494949',
  black9: '#545454',
  black10: '#626262',
  black11: '#a5a5a5',
  black12: '#fff',
  ...postfixObjKeys(lightColors, 'Light'),
  ...postfixObjKeys(darkColors, 'Dark'),
}

export const brandColor = {
  light: color.yellow6Light,
  dark: color.yellow6Dark,
}

export const palettes = (() => {
  const transparent = (hsl: string, opacity = 0) =>
    hsl.replace(`%)`, `%, ${opacity})`).replace(`hsl(`, `hsla(`)

  const getColorPalette = (
    colors: Object,
    accentColors: Object,
    scheme: 'light' | 'dark'
  ): string[] => {
    const colorPalette = Object.values(colors)
    const colorI = colorPalette.length - 4
    const accentPalette = Object.values(accentColors)
    const accentBackground = accentPalette[0]
    const accentColor = accentPalette[accentPalette.length - 1]
    const isDark = scheme === 'dark'
    const adjustForDarkness = isDark ? 0.5 : 1
    return [
      accentBackground,
      transparent(colorPalette[0], 0),
      transparent(colorPalette[0], 0.25 * adjustForDarkness),
      transparent(colorPalette[0], 0.5 * adjustForDarkness),
      transparent(colorPalette[0], 0.75 * adjustForDarkness),
      ...colorPalette,
      transparent(colorPalette[colorI], 0.75),
      transparent(colorPalette[colorI], 0.5),
      transparent(colorPalette[colorI], 0.25),
      transparent(colorPalette[colorI], 0),
      accentColor,
    ]
  }

  const lightPalette = [
    brandColor.light,
    color.white0,
    color.white025,
    color.white05,
    color.white075,
    color.white1,
    color.white2,
    color.white3,
    color.white4,
    color.white5,
    color.white6,
    color.white7,
    color.white8,
    color.white9,
    color.white10,
    color.white11,
    color.white12,
    '#000',
    color.black075,
    color.black05,
    color.black025,
    color.black0,
    brandColor.dark,
  ]

  const darkPalette = [
    brandColor.dark,
    color.black0,
    color.black025,
    color.black05,
    color.black075,
    color.black1,
    color.black2,
    color.black3,
    color.black4,
    color.black5,
    color.black6,
    color.black7,
    color.black8,
    color.black9,
    color.black10,
    color.black11,
    color.black12,
    '#fff',
    color.white075,
    color.white05,
    color.white025,
    color.white0,
    brandColor.light,
  ]

  const lightColorNames = objectKeys(colorTokens.light)
  const lightPalettes = objectFromEntries(
    lightColorNames.map(
      (key, index) =>
        [
          `light_${key}`,
          getColorPalette(
            colorTokens.light[key],
            colorTokens.light[lightColorNames[(index + 1) % lightColorNames.length]],
            'light'
          ),
        ] as const
    )
  )

  const darkColorNames = objectKeys(colorTokens.dark)
  const darkPalettes = objectFromEntries(
    darkColorNames.map(
      (key, index) =>
        [
          `dark_${key}`,
          getColorPalette(
            colorTokens.dark[key],
            colorTokens.light[darkColorNames[(index + 1) % darkColorNames.length]],
            'dark'
          ),
        ] as const
    )
  )

  const colorPalettes = {
    ...lightPalettes,
    ...darkPalettes,
  }

  return {
    light: lightPalette,
    dark: darkPalette,
    ...colorPalettes,
  }
})()
