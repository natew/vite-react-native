import { Button, SizableText, XStack, type ButtonProps } from 'tamagui'
import { useAuth } from '~/better-auth/authClient'
import type { Message, MessageWithRelations, Reaction } from '~/zero/schema'
import { zero } from '~/zero/zero'

export const MessageReactions = ({ message }: { message: MessageWithRelations }) => {
  const reactionCounts: Record<string, number> = {}
  for (const reaction of message.reactions) {
    if (reaction.id) {
      reactionCounts[reaction.id] ||= 0
      reactionCounts[reaction.id]++
    }
  }

  return (
    <XStack>
      {Object.entries(reactionCounts).map(([id, count]) => {
        const reaction = message.reactions.find((x) => x.id === id)
        if (!reaction) {
          return null
        }
        return (
          <ReactionButton key={reaction.id} count={count} message={message} reaction={reaction} />
        )
      })}
    </XStack>
  )
}

export const ReactionButton = ({
  reaction,
  message,
  count,
  ...rest
}: ButtonProps & {
  count?: number
  message: Message
  reaction: Pick<Reaction, 'id' | 'value'>
}) => {
  const { user } = useAuth()

  return (
    <Button
      chromeless
      size="$2.5"
      {...rest}
      onPress={() => {
        if (!user) {
          return
        }

        zero.mutate.messageReaction.insert({
          messageID: message.id,
          reactionID: reaction.id,
          creatorID: user.id,
        })
      }}
    >
      {typeof count === 'number' && (
        <SizableText
          pos="absolute"
          t={-5}
          br="$10"
          r={-5}
          bg="$color5"
          w={20}
          h={20}
          size="$1"
          lh={20}
          ai="center"
          jc="center"
        >
          {count}
        </SizableText>
      )}
      {reaction.value}
    </Button>
  )
}
