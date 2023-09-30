import Mitt from 'mitt'

export type Events = {
    'data:word:graph': { wordId: number | '*' },

    'ui:shortcut': { shortcutId: string }
}

export const mitt = Mitt<Events>()
