import { reactive } from 'vue'

import { kDispose } from '@util/disposable'
import { mitt } from '@util/mitt'

export type KeyCombination = {
    ctrl: boolean
    alt: boolean
    shift: boolean
    meta: boolean
    key: string
}

export type Shortcut = {
    id: string
    key: KeyCombination
    info: string
    precedence?: number
    isActive?: () => boolean
    action?: () => void
}

export const shortcuts: Record<string, Shortcut> = reactive({})

export const registerShortcut = (shortcut: Shortcut) => {
    const { id } = shortcut
    if (id in shortcuts) return null
    shortcuts[id] = shortcut
    return {
        [kDispose]: () => {
            delete shortcuts[id]
        }
    }
}

export const registerShortcuts = (shortcuts: Shortcut[]) => shortcuts.map(registerShortcut)

export const disposeShortcuts = (handles: ReturnType<typeof registerShortcuts>) => {
    handles.forEach(handle => {
        handle?.[kDispose]()
    })
}

export const newKey = (keyCombinationStr: string) => {
    const [ key, ...modifiers ] = keyCombinationStr
        .split(/\s*\+\s*/)
        .reverse()
        .map((s, i) => i ? s.toLowerCase() : s)
    return {
        key,
        ctrl: modifiers.includes('ctrl'),
        alt: modifiers.includes('alt'),
        shift: modifiers.includes('shift'),
        meta: modifiers.includes('meta'),
    }
}

const isKeyMatched = (event: KeyboardEvent, key: KeyCombination) => (
    event.key === key.key &&
    event.ctrlKey === key.ctrl &&
    event.altKey === key.alt &&
    event.shiftKey === key.shift &&
    event.metaKey === key.meta
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
