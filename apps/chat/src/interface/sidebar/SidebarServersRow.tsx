import { Plus } from '@tamagui/lucide-icons'
import { Circle, ScrollView, styled, XStack, YStack } from 'tamagui'
import { useAuth } from '~/better-auth/authClient'
import { useUserServers } from '~/state/server'
import { updateUserState, useUserState } from '~/state/user'
import { Avatar } from '../Avatar'
import { dialogCreateServer } from '../dialogs/actions'

export const SidebarServersRow = () => {
  const servers = useUserServers()
  const [{ activeServer, activeChannels }] = useUserState()
  const { user } = useAuth()

  return (
    <XStack>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <SidebarIndent fd="row" gap="$2" py="$3">
          {servers.map((server) => {
            return (
              <Avatar
                key={server.id}
                onPress={() => {
                  updateUserState({
                    activeServer: server.id,
                  })
                }}
                size={42}
                active={activeServer === server.id}
                image={server.icon}
              />
            )
          })}

          <Circle
            onPress={async () => {
              if (await dialogCreateServer()) {
                console.info('created')
              }
            }}
            size={42}
            bg="$color9"
          >
            <Plus />
          </Circle>
        </SidebarIndent>
      </ScrollView>
    </XStack>
  )
}

const SidebarIndent = styled(YStack, {
  px: '$3',
})
