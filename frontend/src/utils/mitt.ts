import Mitt from 'mitt'

export type Events = {
    'data:word:graph': { wordId: number | '*' }
    'data:archive:update': { dataName: string }

    'ui:shortcut': { shortcutId: string }
    'ui:word:navigate': { action: 'up' | 'down' }
    'ui:re-edit': {}
}

export const mitt = Mitt<Events>()

mitt.on('*', (event, data) => {
    console.log('[mitt] %s %o', event, data)
})
