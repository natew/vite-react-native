import { createEmitter } from '~/helpers/emitter'
import type { DialogType } from './types'
import { Dialog, styled } from 'tamagui'

export const [dialogEmit, dialogListen, useDialogEmit] = createEmitter<DialogType>()

export const DialogOverlay = styled(Dialog.Overlay, {
  // @ts-ignore
  'data-tauri-drag-region': true,
  animation: 'quickest',
  enterStyle: { opacity: 0 },
  exitStyle: { opacity: 0 },
  bg: '$background075',
})

export const DialogContent = styled(Dialog.Content, {
  animation: [
    'quickest',
    {
      opacity: {
        overshootClamping: true,
      },
    },
  ],
  bordered: true,
  elevate: true,
  bg: '$color2',
  w: '60%',
  h: '50%',
  miw: 200,
  maw: 500,
  mih: 400,
  mah: 'max-content',
  enterStyle: { x: 0, y: -10, opacity: 0 },
  exitStyle: { x: 0, y: 10, opacity: 0 },
  gap: '$4',
})
