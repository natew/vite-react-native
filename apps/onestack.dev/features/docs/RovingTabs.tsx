import { Image } from '@tamagui/image-next'
import { useState } from 'react'
import type { TabLayout, TabsTabProps, ViewProps } from 'tamagui'
import { AnimatePresence, ScrollView, SizableText, Tabs, XStack, YStack, styled } from 'tamagui'
import { Code } from './Code'
import { PACKAGE_MANAGERS, useBashCommand } from './useBashCommand'

export function RovingTabs({ className, children, code, size, ...rest }) {
  const { showTabs, transformedCommand, selectedPackageManager, setPackageManager } =
    useBashCommand(code || children, className)

  const [tabState, setTabState] = useState<{
    // Layout of the Tab user might intend to select (hovering / focusing)
    intentAt: TabLayout | null
    // Layout of the Tab user selected
    activeAt: TabLayout | null
    // Used to get the direction of activation for animating the active indicator
    prevActiveAt: TabLayout | null
  }>({
    intentAt: null,
    activeAt: null,
    prevActiveAt: null,
  })

  const setIntentIndicator = (intentAt: TabLayout | null) =>
    setTabState((prevTabState) => ({ ...prevTabState, intentAt }))
  const setActiveIndicator = (activeAt: TabLayout | null) =>
    setTabState((prevTabState) => ({
      ...prevTabState,
      prevActiveAt: tabState.activeAt,
      activeAt,
    }))

  const { activeAt, intentAt, prevActiveAt } = tabState

  const handleOnInteraction: TabsTabProps['onInteraction'] = (type, layout) => {
    if (type === 'select') {
      setActiveIndicator(layout)
    } else {
      setIntentIndicator(layout)
    }
  }

  const content = (
    <Code
      p="$4"
      backgroundColor="transparent"
      f={1}
      className={className}
      fontSize={15}
      lineHeight={25}
      color="$color12"
      {...rest}
    >
      {showTabs ? transformedCommand : children}
    </Code>
  )

  return (
    <>
      {showTabs ? (
        <Tabs
          activationMode="manual"
          orientation="horizontal"
          size="$4"
          br="$4"
          value={selectedPackageManager}
          onPress={(e) => e.stopPropagation()}
          onValueChange={setPackageManager}
          group
          mt={1}
        >
          <YStack w="100%">
            <YStack p="$1.5" m="$2" mb={0} br="$5">
              <AnimatePresence initial={false}>
                {intentAt && (
                  <TabIndicator
                    w={intentAt.width}
                    h={intentAt.height}
                    x={intentAt.x}
                    y={intentAt.y}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence initial={false}>
                {activeAt && (
                  <TabIndicator
                    w={activeAt.width}
                    h={activeAt.height}
                    x={activeAt.x}
                    y={activeAt.y}
                  />
                )}
              </AnimatePresence>

              <Tabs.List disablePassBorderRadius loop={false} aria-label="package manager" gap="$2">
                <>
                  {PACKAGE_MANAGERS.map((pkgManager) => (
                    <Tab
                      key={pkgManager}
                      active={selectedPackageManager === pkgManager}
                      pkgManager={pkgManager}
                      onInteraction={handleOnInteraction}
                    />
                  ))}
                </>
              </Tabs.List>
            </YStack>

            <Tabs.Content value={selectedPackageManager} forceMount>
              {content}
            </Tabs.Content>
          </YStack>
        </Tabs>
      ) : (
        <ScrollView
          style={{ width: '100%' }}
          contentContainerStyle={{ minWidth: '100%' }}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      )}
    </>
  )
}

function Tab({
  active,
  pkgManager,
  logo,
  onInteraction,
}: {
  active?: boolean
  pkgManager: string
  logo?: string
  onInteraction: TabsTabProps['onInteraction']
}) {
  const imageName = logo ?? pkgManager
  return (
    <Tabs.Tab
      unstyled
      pl="$2"
      pr="$2.5"
      py="$1.5"
      gap="$1.5"
      bg="transparent"
      bw={0}
      bc="$color1"
      shadowRadius={0}
      value={pkgManager}
      onInteraction={onInteraction}
    >
      <XStack gap="$1.5" ai="center" jc="center">
        <Image
          scale={imageName === 'pnpm' ? 0.7 : 0.8}
          y={imageName === 'pnpm' ? 0 : 0}
          src={`/logos/${imageName}.svg`}
          width={16}
          height={16}
          alt={pkgManager}
        />
        <SizableText
          y={-0.5}
          size="$3"
          col={active ? '$color12' : '$color11'}
          o={active ? 1 : 0.75}
        >
          {pkgManager}
        </SizableText>
      </XStack>
    </Tabs.Tab>
  )
}

function TabIndicator({ active, ...props }: { active?: boolean } & ViewProps) {
  return (
    <YStack
      pos="absolute"
      bg="$color5"
      o={0.7}
      br="$4"
      animation="quickest"
      enterStyle={{
        o: 0,
      }}
      exitStyle={{
        o: 0,
      }}
      {...(active && {
        bg: '$color8',
        o: 0.6,
      })}
      {...props}
    />
  )
}

const AnimatedYStack = styled(YStack, {
  f: 1,
  x: 0,
  o: 1,

  animation: '100ms',
  variants: {
    // 1 = right, 0 = nowhere, -1 = left
    direction: {
      ':number': (direction) => ({
        enterStyle: {
          x: direction > 0 ? -10 : -10,
          opacity: 0,
        },
        exitStyle: {
          zIndex: 0,
          x: direction < 0 ? -10 : -10,
          opacity: 0,
        },
      }),
    },
  } as const,
})
