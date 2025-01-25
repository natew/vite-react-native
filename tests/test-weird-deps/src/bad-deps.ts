import MaskedView from '@react-native-masked-view/masked-view'
import * as Sentry from '@sentry/react-native'
import { FlashList } from '@shopify/flash-list'
import { Path } from 'react-native-svg'
import WebView from 'react-native-webview'
import { View } from '@rn-primitives/slot'

function ensureExists(name: string, x: any) {
  if (!x) {
    throw new Error(`Doesn't exist! ${name} got ${x}`)
  }
}

ensureExists('@rn-primitives/slot', View)
ensureExists('react-native-svg', Path)
ensureExists('@react-native-masked-view/masked-view', MaskedView)
ensureExists('react-native-webview', WebView)
ensureExists('@sentry/react-native', Sentry)
ensureExists('@shopify/flash-list', FlashList)
