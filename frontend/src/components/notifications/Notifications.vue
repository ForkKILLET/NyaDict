<script setup lang="ts">
import * as notif from '@util/notif'

import Noti from '@comp/notifications/Noti.vue'
import ListTransitionGroup from '@comp/transitions/ListTransitionGroup.vue'
</script>

<template>
    <ListTransitionGroup class="notis">
        <template v-for="noti of notif.notis">
            <div
                v-if="noti"
                :key="noti.createTime"
                class="noti-outter"
                :class="noti.type"
            >
                <Noti :noti="noti" />
            </div>
        </template>
    </ListTransitionGroup>
</template>

<style scoped>
.notis {
    position: fixed;
    width: 100%;
    pointer-events: none;
    z-index: var(--zi-noti);
    top: 0;
    display: flex;
    flex-flow: column;
    align-items: center;
}

.noti {
    pointer-events: all;
}

.list-leave-active > .noti {
    animation-play-state: paused;
}

.noti-outter.charge.list-enter-from {
    opacity: 1;
}
</style>
