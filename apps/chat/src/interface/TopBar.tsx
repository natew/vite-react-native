import { ChevronLeft, ChevronRight, Search, Settings2, UserCircle } from '@tamagui/lucide-icons'
import { memo, useEffect, useRef } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'
import { H1, Input, TooltipSimple, XGroup, XStack, YStack } from 'tamagui'
import { useAuth } from '~/better-auth/authClient'
import { HotMenuButton } from '~/interface/hotmenu/HotMenuButton'
import { useCurrentChannel } from '~/state/channel/useCurrentChannel'
import { useCurrentServer } from '~/state/server/useCurrentServer'
import {
  setShouldRedirectBackToTauri,
  shouldRedirectBackToTauri,
  useTauriAuthDeepLink,
} from '~/tauri/authFlowHelpers'
import { isTauri } from '~/tauri/constants'
import { updateSessionState, useSessionState } from '../state/session'
import { Avatar } from './Avatar'
import { ButtonSimple } from './buttons/ButtonSimple'
import { dialogRedirectToTauri, ensureSignedUp } from './dialogs/actions'

export const TopBar = memo(() => {
  const { token } = useAuth()
  const tauriDeepLink = useTauriAuthDeepLink()

  const server = useCurrentServer()
  const channel = useCurrentChannel()
  const sessionState = useSessionState()

  useEffect(() => {
    if (shouldRedirectBackToTauri()) {
      // idk why this settimeout fixes it not showing, hook not registered int ime
      // but it seems it should be based on my logs...
      setTimeout(() => {
        setShouldRedirectBackToTauri(false)
        dialogRedirectToTauri()
      })
    }
  }, [token])

  return (
    <XStack
      data-tauri-drag-region
      rounded="$4"
      mx={2}
      items="center"
      justify="space-between"
      y={2}
      height={30}
      pl={72}
      pr={4}
      mb={4}
    >
      <XStack pointerEvents="box-none" gap="$3" items="center">
        <XStack items="center" gap="$2">
          <TooltipSimple label="Menu">
            <HotMenuButton />
          </TooltipSimple>

          {isTauri && (
            <XGroup>
              <ButtonSimple scaleIcon={0.9} icon={ChevronLeft}></ButtonSimple>
              <ButtonSimple scaleIcon={0.9} icon={ChevronRight}></ButtonSimple>
            </XGroup>
          )}
        </XStack>

        <H1
          data-tauri-drag-region
          cursor="default"
          select="none"
          pointerEvents="none"
          m={0}
          opacity={0.6}
          fontSize={12}
          textTransform="uppercase"
          letterSpacing={2}
        >
          {server?.name || '-'} - #{channel?.name || '-'}
        </H1>
      </XStack>

      <XStack items="center" gap="$1">
        <TopBarSearch />

        <XStack items="center">
          {!!sessionState?.showPanel && (
            <YStack fullscreen items="center" justify="center" z={100}>
              <ButtonSimple
                onPress={() => {
                  updateSessionState({
                    showPanel: null,
                  })
                }}
              >
                <ChevronRight size={20} opacity={0.5} />
              </ButtonSimple>
            </YStack>
          )}

          <XStack
            items="center"
            {...(sessionState?.showPanel && {
              opacity: 0,
            })}
          >
            <ButtonSimple
              disabled={!server}
              tooltip="Server settings"
              onPress={() => {
                if (sessionState?.showPanel === 'settings') {
                  updateSessionState({
                    showPanel: undefined,
                  })
                } else {
                  updateSessionState({
                    showPanel: 'settings',
                  })
                }
              }}
            >
              <Settings2 opacity={0.5} size={20} />
            </ButtonSimple>

            <UserButton />
          </XStack>
        </XStack>

        {!isTauri && token && (
          <a href={tauriDeepLink}>
            <ButtonSimple>Open app</ButtonSimple>
          </a>
        )}
      </XStack>
    </XStack>
  )
})

const UserButton = () => {
  const { user, loggedIn } = useAuth()

  return (
    <>
      <ButtonSimple
        onPress={(e) => {
          if (loggedIn) {
            e.preventDefault()
            updateSessionState({
              showPanel: 'user',
            })
            return
          }

          ensureSignedUp()
        }}
      >
        {user?.image ? (
          <Avatar size={20} image={user.image} />
        ) : (
          <UserCircle size={20} opacity={0.5} />
        )}
      </ButtonSimple>
    </>
  )
}

const TopBarSearch = () => {
  const inputRef = useRef<Input>(null)

  useHotkeys('meta+f', () => {
    inputRef.current?.focus()
  })

  return (
    <XStack items="center" gap="$2" mr="$4">
      <Search size={16} opacity={0.5} />
      <Input
        bg="transparent"
        ref={inputRef}
        width={250}
        placeholder=""
        size="$2"
        height={26}
        borderWidth={0}
        hoverStyle={{
          bg: '$shadow1',
        }}
        focusStyle={{
          bg: '$shadow1',
          outlineWidth: 0,
        }}
      />
    </XStack>
  )
}
