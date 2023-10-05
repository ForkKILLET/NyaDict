<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components'

import { useModal } from '@store/modal'
import { newKey, registerShortcuts } from '@util/keyboard'

const modalStore = useModal()

registerShortcuts([
    {
        id: 'modal:close',
        priority: 1,
        key: newKey('Escape'),
        info: 'Modalを閉める', // FIXME: Japanese of 'modal window'
        isActive: () => !! modalStore.component,
        action: modalStore.forceClose
    }
])
</script>

<template>
    <div class="modal" v-if="modalStore.component">
        <div v-on-click-outside="modalStore.forceClose" class="modal-inner card">
            <fa-icon @click="modalStore.forceClose" icon="times-circle" class="button" />
            <component :is="modalStore.component" />
        </div>
    </div>
</template>

<style scoped>
.modal {
    position: fixed;
    left: 0;
    top: 0;
    width: 100vw;
    height: 100vh;
    z-index: 10;
    display: flex;
    align-items: center;
    background-color: #000000aa;
}

.modal-inner {
    position: relative;
    width: 80%;
    margin: auto;
}

.modal-inner > svg.button {
    position: absolute;
    right: .8em;
    top: 1em;
}
</style>
