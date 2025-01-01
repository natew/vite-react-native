import type { IconProps } from '@tamagui/helpers-icon'
import { HousePlus, Server, User, UserPlus } from '@tamagui/lucide-icons'
import { useMemo } from 'react'
import { useAuth } from '~/better-auth/authClient'
import {
  dialogAddFriend,
  dialogCreateServer,
  dialogJoinServer,
  dialogSignup,
} from '~/interface/dialogs/actions'

type HotMenuItem = {
  name: string
  Icon: React.NamedExoticComponent<IconProps>
  action: () => void
}

export const useHotMenuItems = () => {
  const { loggedIn } = useAuth()

  const items = useMemo(() => {
    return loggedIn ? globalMenuItems : globalLoggedOutItems
  }, [loggedIn])

  return items
}

const globalMenuItems: HotMenuItem[] = [
  {
    name: 'Add friend',
    Icon: UserPlus,
    action() {
      dialogAddFriend()
    },
  },

  {
    name: 'Join server',
    Icon: Server,
    action() {
      dialogJoinServer()
    },
  },

  {
    name: 'Create server',
    Icon: HousePlus,
    action() {
      dialogCreateServer()
    },
  },
]

const globalLoggedOutItems: HotMenuItem[] = [
  {
    name: 'Login',
    Icon: User,
    action() {
      dialogSignup()
    },
  },

  ...globalMenuItems,
]
