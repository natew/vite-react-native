import { isWeb, View } from 'tamagui'
import { Slot, Stack } from 'vxs'
import { ToggleThemeButton } from '~/features/theme/ToggleThemeButton'

export default function FeedLayout() {
  return (
    <>
      {isWeb ? (
        <Slot />
      ) : (
        <Stack
          screenOptions={{
            headerRight() {
              return (
                <View px="$2">
                  <ToggleThemeButton />
                </View>
              )
            },
          }}
        >
          <Stack.Screen name="index" options={{ title: 'Feed' }} />
          <Stack.Screen name="post/[id]" options={{ title: 'Post' }} />
        </Stack>
      )}
    </>
  )
}
