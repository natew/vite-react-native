import { useCurrentChannelMessages } from '~/state/message/useCurrentChannelMessages'
import { MessagesList } from '../messages/MessagesList'
import { useCurrentThreadWithMessages } from '~/state/message/useCurrentThread'

export const MainMessagesList = () => {
  const messages = useCurrentChannelMessages() || []
  const hasOpenThread = !!useCurrentThreadWithMessages()

  return <MessagesList disableEvents={hasOpenThread} messages={messages} />
}
