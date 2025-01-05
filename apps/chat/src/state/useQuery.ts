import { useAuth } from '~/better-auth/authClient'
import { useQuery } from '../zero/zero'

// this isnt the ultimate organization probably
// waiting until this gets bigger and finding patterns
// for now just throwing a lot of useQuery into here

export const useServersQuery = () => useQuery((q) => q.server)[0]

export const useUser = () => {
  const { user } = useAuth()
  return useQuery((q) => q.user.where('id', user?.id || '').limit(1))[0][0]
}

export const useFriends = () => {
  const { user } = useAuth()
  return (
    useQuery(
      (q) =>
        q.user
          .where('id', user?.id || '')
          .limit(1)
          .whereExists('friendshipsAccepted', (q) => q.where('accepted', true))
          .whereExists('friendshipsRequested', (q) => q.where('accepted', true))
      // .related('friendships', (q) => q.one())
    )[0][0]?.friendships || []
  )
}

export const useUserServers = () => {
  const { user } = useAuth()
  return (
    useQuery((q) =>
      q.user
        .limit(1)
        .where('id', user?.id || '')
        .related('servers')
    )[0][0]?.servers || []
  )
}
