<script setup lang="ts">
import * as notif from '../../utils/notif'

import Noti from './Noti.vue'
import ListTransitionGroup from '../transitions/ListTransitionGroup.vue'
</script>

<template>
    <ListTransitionGroup class="notis">
        <template v-for="noti, id of notif.notis" :key="id">
            <div v-if="noti">
                <Noti
                    :noti="noti"
                    @click="notif.remove(id)"
                    @expire="notif.remove(id)"
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
