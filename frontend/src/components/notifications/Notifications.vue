<script setup lang="ts">
import { add, notis, remove } from '../../utils/notifications'

import Noti from './Noti.vue'
import ListTransitionGroup from '../transitions/ListTransitionGroup.vue'

add({
    content: 'abcdefg',
    type: 'info',
    duration: 10 * 1000
})
</script>

<template>
    <ListTransitionGroup class="notis">
        <template v-for="noti, id of notis">
            <div>
                <Noti
                    v-if="noti"
                    :noti="noti"
                    :key="id"
                    @click="remove(id)"
                />
            </div>
        </template>
    </ListTransitionGroup>
</template>

<style scoped>
.notis {
    position: fixed;
    width: 100%;
    pointer-events: none;
    z-index: 1;
    top: 0;
    display: flex;
    flex-flow: column;
    align-items: center;
}

.noti {
    pointer-events: all;
}
</style>
