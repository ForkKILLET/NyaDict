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
    action: () => void
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

export const registerShortcuts = (shortcuts: Shortcut[]) => {
    shortcuts.forEach(registerShortcut)
}

export const newKey = (keyCombinationStr: string) => {
    const [ key, ...modifiers ] = keyCombinationStr
        .split('+')
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
    for (const id in shortcuts) {
        const shortcut = shortcuts[id]
        if (isKeyMatched(event, shortcut.key)) {
            event.preventDefault()
            shortcut.action()
            mitt.emit('ui:shortcut', { shortcutId: id })
            break
        }
    }
})
