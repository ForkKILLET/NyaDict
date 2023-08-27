import { useMediaQuery } from '@vueuse/core'

export const isPortrait = useMediaQuery('screen and (orientation: portrait) and (max-device-width: 600px)')

export const isPreferDark = useMediaQuery('(prefers-color-scheme: dark)')
