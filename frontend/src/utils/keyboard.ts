import { reactive } from 'vue'

import { useConfigData } from '@store/config'

import { kDispose } from '@util/disposable'
import { mitt } from '@util/mitt'

export type KeyCombination = {
    ctrlKey: boolean
    altKey: boolean
    shiftKey: boolean
    metaKey: boolean
    key: string
}

export type Shortcut = {
    id: string
    defaultKey: KeyCombination
    key: KeyCombination
    info: string
    precedence?: number
    isActive?: () => boolean
    action?: () => void
}

export const shortcuts: Record<string, Shortcut> = reactive({})

export const registerShortcut = (shortcut: Omit<Shortcut, 'defaultKey'>) => {
    const { id } = shortcut
    if (id in shortcuts) return null
    shortcuts[id] = {
        ...shortcut,
        defaultKey: shortcut.key
    }
    const config = useConfigData()
    const keyStr = config.value.shortcuts[id]
    if (keyStr) try {
        shortcuts[id].key = newKey(keyStr)
    }
    catch {}

    return {
        [kDispose]: () => {
            delete shortcuts[id]
        }
    }
}

export const registerShortcuts = (shortcuts: Omit<Shortcut, 'defaultKey'>[]) => shortcuts.map(registerShortcut)

export const disposeShortcuts = (handles: ReturnType<typeof registerShortcuts>) => {
    handles.forEach(handle => {
        handle?.[kDispose]()
    })
}

export const newKey = (keyCombinationStr: string): KeyCombination => {
    const [ key, ...modifiers ] = keyCombinationStr
        .split(/\s*\+\s*/)
        .reverse()
        .map((s, i) => i ? s.toLowerCase() : s)
    return {
        key,
        ctrlKey: modifiers.includes('ctrl'),
        altKey: modifiers.includes('alt'),
        shiftKey: modifiers.includes('shift'),
        metaKey: modifiers.includes('meta'),
    }
}

export const fromKey = (key: KeyCombination): string => (
    (key.metaKey ? 'Meta + ' : '') +
    (key.ctrlKey ? 'Ctrl + ' : '') +
    (key.altKey ? 'Alt + ' : '') +
    (key.shiftKey ? 'Shift + ' : '') +
    key.key
)

const isKeyMatched = (event: KeyboardEvent, key: KeyCombination) => (
    event.key === key.key &&
    event.ctrlKey === key.ctrlKey &&
    event.altKey === key.altKey &&
    event.shiftKey === key.shiftKey &&
    event.metaKey === key.metaKey
)

window.addEventListener('keydown', (event) => {
    const { activeElement } = window.document
    const requiringModifier = !! activeElement && [ 'INPUT', 'TEXTAREA' ].includes(activeElement.tagName)
    if (requiringModifier && ! (event.ctrlKey || event.altKey || event.metaKey)) return

    const shortcutList = Object
        .values(shortcuts)
        .filter(shortcut => shortcut.isActive?.() !== false)
        .sort((a, b) => (b.precedence ?? 0) - (a.precedence ?? 0))

    for (const shortcut of shortcutList) {
        if (shortcut.isActive?.() === false) continue
        if (isKeyMatched(event, shortcut.key)) {
            event.preventDefault()
            shortcut.action?.()
            mitt.emit('ui:shortcut', { shortcutId: shortcut.id })
            break
        }
    }
})
