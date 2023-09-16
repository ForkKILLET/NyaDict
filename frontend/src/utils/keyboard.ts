import { kDispose } from '@util/disposable'

export type Key = string

export type Shortcut = {
    key: Key
    info: string
    action: () => void
}

const shortcuts: Record<Key, Shortcut> = {}

export const registerShortcut = (shortcut: Shortcut) => {
    const { key } = shortcut
    if (key in shortcuts) return null
    shortcuts[key] = shortcut
    return {
        [kDispose]: () => {
            delete shortcuts[key]
        }
    }
}
