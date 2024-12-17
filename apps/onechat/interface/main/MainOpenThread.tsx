import { YStack } from 'tamagui'
import { updateUserCurrentChannel, useCurrentThread } from '~/features/state/queries/useUserState'
import { ButtonClose } from '../ButtonClose'
import { MessagesList } from '../messages/MessagesList'
import { MessageInput } from '../messages/MessageInput'

export const MainOpenThread = () => {
  const thread = useCurrentThread()

  if (!thread) {
    return null
  }

  return (
    <YStack
      bg="$color2"
      shadowColor="$shadowColor"
      shadowRadius={10}
      pos="absolute"
      t={0}
      r={0}
      b={0}
      w="80%"
      zi={1000}
    >
      <ButtonClose
        pos="absolute"
        zi={1000}
        t={10}
        l={-20}
        onPress={() => {
          updateUserCurrentChannel({
            openedThreadId: undefined,
          })
        }}
      />
      <MessagesList messages={thread?.messages || []} />
      <MessageInput />
    </YStack>
  )
}
