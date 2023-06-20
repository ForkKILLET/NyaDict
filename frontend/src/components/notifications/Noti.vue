<script setup lang="ts">
import type { Noti, NotiType } from '../../utils/notifications'

defineProps<{
    noti: Noti
}>()

const typeIcons: Record<NotiType, string> = {
    info: 'info-circle',
    error: 'times-circle',
    success: 'check-circle',
    pending: 'spinner'
}
</script>

<template>
    <div class="inline noti">
        <fa-icon
            :icon="typeIcons[noti.type]"
            :class="noti.type"
            class="noti-type"
            :spin="noti.type === 'pending'"
        />
        <span>{{ noti.content }}</span>
        <div
            v-if="noti.duration"
            class="noti-lasting"
            :style="{ '--duration': noti.duration + 'ms' }"
        >
            <div class="noti-lasting-inner"></div>
        </div>
    </div>
</template>

<style scoped>
.noti {
    padding: .5em 1em;
    margin: .5em 0;
    border-radius: .8rem;
    background-color: #fff;
    box-shadow: 0 0 .4em #00000016;
    transition: .5s opacity;
    cursor: pointer;
    overflow: hidden;
}

@keyframes noti-progress {
    from {
        width: 100%;
    }
    to {
        width: 0;
    }
}

.noti-lasting {
    position: relative;
    top: .5em;
    left: -1em;
    height: 3px;
    width: calc(100% + 2em);
}

.noti-lasting-inner {
    height: 100%;
    background-color: #8358f9;
    animation: var(--duration) linear forwards noti-progress;
}

.noti:hover {
    opacity: .8;
}

.noti-type {
    margin-right: .5em;
}
.noti-type.info {
    color: #8358f9;
}
.noti-type.error {
    color: #ec4e1e;
}
.noti-type.success {
    color: #95e35d;
}
</style>
