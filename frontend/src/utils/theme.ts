import { watch, type Ref } from 'vue'

import { isPreferDark } from '@util/media'

export const themeNames = [ 'default', 'light', 'dark', 'cosmos' ] as const
export type ThemeName = typeof themeNames[number]

export const useTheme = (theme: Ref<ThemeName>) => {
    const setTheme = (name: ThemeName) => {
        const root = document.documentElement
        root.className = name
    }

    watch(theme, name => {
        if (name !== 'default') setTheme(name)
        else setTheme(isPreferDark.value ? 'dark' : 'light')
    }, { immediate: true })

    watch(isPreferDark, dark => {
        if (theme.value === 'default') setTheme(dark ? 'dark' : 'light')
    }, { immediate: true })

    return {
        theme
    }
}
