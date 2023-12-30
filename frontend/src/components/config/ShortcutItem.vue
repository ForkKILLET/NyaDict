<script setup lang="ts">
import { ref, computed } from 'vue'
import { useEventListener } from '@vueuse/core'

import { mitt } from '@util/mitt'
import { useConfigData } from '@store/config'

import { fromKey, newKey, type Shortcut } from '@util/keyboard'
import { addNoti } from '@util/notif'

const props = defineProps<{
    shortcut: Shortcut
}>()

const config = useConfigData()
const editMode = ref(false)
const currKeyStr = ref<string>()

let dispose: () => void

const startEdit = () => {
    const id = props.shortcut.id
    mitt.emit('ui:shortcut:edit', { shortcutId: id })
    editMode.value = true

    addNoti({
        type: 'info',
        content: computed(() => `ショートカットを配置しています。今は <${ currKeyStr.value ?? '...' }> です。`),
        actions: [
            {
                info: '保存',
                primary: true,
                onClick: () => {
                    const keyStr = currKeyStr.value
                    if (keyStr) {
                        config.value.shortcuts[id] = keyStr
                        props.shortcut.key = newKey(keyStr)
                    }
                    else {
                        delete config.value.shortcuts[id]
                        props.shortcut.key = props.shortcut.defaultKey
                    }
                    endEdit()
                }
            },
            {
                info: 'キャンセル',
                onClick: () => {
                    endEdit()
                }
            }
        ]
    })

    dispose = useEventListener(window, 'keydown', (event): void => {
        event.preventDefault()
        event.stopPropagation()

        const keyStr = fromKey(event)
        currKeyStr.value = keyStr
    })
}
const endEdit = () => {
    editMode.value = false
    dispose()
}

mitt.on('ui:shortcut:edit', ({ shortcutId }) => {
    if (editMode.value && shortcutId !== props.shortcut.id) {
        endEdit()
    }
})
</script>

<template>
    <div
        class="shortcut-item"
        :class="{ inactive: shortcut.isActive?.() === false }"
        @click="startEdit"
    >
        <span class="shortcut-info">{{ shortcut.info }}</span>

        <kbd class="badge">{{
            editMode ? '...' : fromKey(shortcut.key)
        }}</kbd>
    </div>
</template>

<style scoped>
.shortcut-item {
    display: flex;
    justify-content: space-between;
}

.shortcut-item.inactive > .shortcut-info {
    color: #888;
}

kbd {
    font-family: var(--font-mono);
}
</style>
