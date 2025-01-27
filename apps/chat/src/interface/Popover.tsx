import { Popover, type PopoverContentProps } from 'tamagui'

export const PopoverContent = ({
  children,
  arrow = true,
  ...props
}: PopoverContentProps & { arrow?: boolean }) => {
  return (
    <Popover.Content
      bg="$color2"
      p={0}
      borderWidth={1}
      items="flex-start"
      borderColor="$borderColor"
      enterStyle={{ y: -10, opacity: 0 }}
      exitStyle={{ y: -10, opacity: 0 }}
      elevation="$5"
      animation={[
        'quicker',
        {
          opacity: {
            overshootClamping: true,
          },
        },
      ]}
      {...props}
    >
      {arrow && <Popover.Arrow borderWidth={1} borderColor="$borderColor" bg="$color2" size="$4" />}

      {children}
    </Popover.Content>
  )
}
