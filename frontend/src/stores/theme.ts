import { watch } from 'vue'
import { defineStore } from 'pinia'

import { storeRef } from '@util/storage'
import { isPreferDark } from '@util/media'

export type ITheme = 'default' | 'light' | 'dark'
export const themes: Record<ITheme, { info: string, icon: string }> = {
    default: { info: '自動', icon: 'wand-magic' },
    light: { info: 'Light', icon: 'sun' },
    dark: { info: 'Dark', icon: 'moon' },
}

export const useTheme = defineStore('theme', () => {
    const theme = storeRef<ITheme>('theme', 'default')

    const setTheme = (name: ITheme) => {
        const root = document.documentElement
        root.className = name
    }

    watch(theme, name => {
        if (name !== 'default') setTheme(name)
    }, { immediate: true })

    watch(isPreferDark, dark => {
        if (theme.value === 'default') setTheme(dark ? 'dark' : 'light')
    }, { immediate: true })

    return {
        theme
    }
})
