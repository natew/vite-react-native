import { Button, YStack } from 'tamagui'
import type { Message } from '~/config/zero/schema'
import { useCurrentChannel } from '~/features/state/queries/useServer'
import { randomID } from '~/features/state/randomID'
import { mutate, resolve, zero } from '~/features/state/zero'
import { getRandomItem } from '~/helpers/getRandomItem'
import { toast } from '~/interface/Toast'

export default () => {
  const channel = useCurrentChannel()

  return (
    <YStack f={1} p="$4" gap="$2">
      <Button
        onPress={async () => {
          const friendships = await resolve(zero.query.friendship)
          for (const friendship of friendships) {
            await mutate.friendship.update({
              ...friendship,
              accepted: true,
            })
          }
          alert('done')
        }}
      >
        All Friendships: Accept
      </Button>

      <Button
        onPress={async () => {
          if (!channel) {
            toast('No channel!')
            return
          }

          const users = await resolve(zero.query.user.limit(5))

          const messages = new Array(100).fill(0).map((_, index) => {
            return {
              channelId: channel.id,
              content: `Lorem ipsum dolo`,
              createdAt: new Date().getTime() - index * 60 * 1000,
              deleted: false,
              id: randomID(),
              senderId: getRandomItem(users)!.id,
              serverId: channel.serverId,
              isThreadReply: false,
              threadId: null,
              updatedAt: null,
            } satisfies Message
          })

          zero.mutateBatch(async (tx) => {
            for (const message of messages) {
              await tx.message.insert(message)
            }
          })
        }}
      >
        Current Channel: insert 100 messages
      </Button>
    </YStack>
  )
}
