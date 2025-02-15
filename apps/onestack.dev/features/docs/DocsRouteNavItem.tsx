import { getStore, useStoreSelector } from '@tamagui/use-store'
import { createElement, useRef } from 'react'
import { SizableText, Spacer, XStack, YStack } from 'tamagui'
import { Link } from 'one'
import { ExternalIcon } from '~/features/icons/ExternalIcon'
import type { NavItemProps } from './types'

export class DocsItemsStore {
  hovered = false
  index = 0
}

export const DocsRouteNavItem = function DocsRouteNavItem({
  children,
  active,
  href,
  icon,
  pending,
  inMenu,
  index,
  external,
}: NavItemProps & {
  icon?: any
  inMenu?: boolean
  index: number
}) {
  const isActive = useStoreSelector(DocsItemsStore, (x) => x.hovered && x.index === index)
  const isExternal = external || href.startsWith('http')
  const ref = useRef<any>()

  return (
    <Link
      {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      href={href as any}
    >
      <XStack
        ref={ref}
        className="docs-nav-item"
        ai="center"
        jc="flex-end"
        px="$4"
        py="$1"
        opacity={pending ? 0.25 : 1}
        pressStyle={{
          backgroundColor: '$background04',
        }}
        pointerEvents={pending ? 'none' : ('inherit' as any)}
        pos="relative"
        onMouseEnter={() => {
          getStore(DocsItemsStore).index = index
        }}
        $sm={{
          py: '$1.5',
        }}
        {...(inMenu && {
          jc: 'flex-start',
        })}
      >
        {!inMenu && (
          <YStack
            className="sidebar-indicator"
            o={active ? 1 : 0}
            pos="absolute"
            t={0}
            b={0}
            l={0}
            br="$2"
            w={2}
            bg={active ? '$color10' : '$backgroundHover'}
          />
        )}
        <SizableText
          size="$5"
          lh="$5"
          cursor="pointer"
          userSelect="none"
          col="$color12"
          opacity={active ? 1 : 0.65}
          // ta={inMenu ? 'left' : 'right'}
          w="100%"
          hoverStyle={{
            o: 0.85,
          }}
          {...(active && {
            fow: '700',
            opacity: 1,
          })}
        >
          {children}
          {!!icon && (
            <>
              &nbsp;
              {createElement(icon, {
                size: 12,
              })}
            </>
          )}
        </SizableText>
        {isExternal && (
          <XStack opacity={0.5}>
            <Spacer size="$2" />
            <ExternalIcon />
          </XStack>
        )}
        {pending ? (
          <>
            <XStack flex={1} />
            <SizableText size="$1" px="$2" py="$1" bg="$background" borderRadius="$3">
              WIP
            </SizableText>
          </>
        ) : null}
      </XStack>
    </Link>
  )
}
