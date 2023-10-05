import Mitt from 'mitt'

export type Events = {
    'data:word:graph': { wordId: number | '*' }

    'ui:shortcut': { shortcutId: string }
    'ui:word:navigate': { action: 'up' | 'down' }
}

export const mitt = Mitt<Events>()

mitt.on('*', (event, data) => {
    console.log('[mitt] %s %o', event, data)
})
