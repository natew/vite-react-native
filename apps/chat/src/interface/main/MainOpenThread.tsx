import { YStack } from 'tamagui'
import { updateUserCurrentChannel, useCurrentThread } from '~/state/user'
import { ButtonClose } from '../ButtonClose'
import { MessagesList } from '../messages/MessagesList'
import { MessageInput } from '../messages/MessageInput'

export const MainOpenThread = () => {
  const thread = useCurrentThread()

  return (
    <YStack
      bg="$color2"
      shadowColor="$shadowColor"
      shadowRadius={10}
      animation={[
        'quicker',
        {
          opacity: {
            overshootClamping: true,
          },
        },
      ]}
      pos="absolute"
      t={0}
      r={0}
      b={0}
      w="70%"
      zi={1000}
      {...(thread
        ? {}
        : {
            opacity: 0,
            pe: 'none',
            x: 7,
          })}
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
      {thread && (
        <>
          <MessagesList messages={thread?.messages || []} />
          <MessageInput inThread />
        </>
      )}
    </YStack>
  )
}
