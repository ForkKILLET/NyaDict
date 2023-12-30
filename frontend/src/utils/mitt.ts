import Mitt from 'mitt'
import { ref, watch, type Ref } from 'vue'

export type Events = {
    'data:word:graph': { wordId: number | '*' }
    'data:word:goto': { wordId: number }
    'data:archive:update': { dataName: string }

    'ui:shortcut': { shortcutId: string }
    'ui:shortcut:edit': { shortcutId: string }
    'ui:word:navigate': { action: 'up' | 'down' }
    'ui:word:filter': {}
    'ui:word:add': {}
    'ui:re-edit': {}
}

export const mitt = Mitt<Events>()

mitt.on('*', (event, data) => {
    console.log('[mitt] %s %o', event, data)
})

export const useFocusSignal = (elRef: Ref<HTMLElement | undefined>, event: keyof Events) => {
    const signal = ref(false)
    mitt.on(event, () => {
        signal.value = true
    })
    watch([ elRef, signal ], ([ el, s ]) => {
        console.log([ el, s ])
        if (el && signal.value) {
            el.focus()
            signal.value = false
        }
    })
}
