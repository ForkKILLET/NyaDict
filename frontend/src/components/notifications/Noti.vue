<script setup lang="ts">
import { type Noti, type NotiType } from '@util/notif'

defineProps<{
    noti: Noti
}>()

const emit = defineEmits<{
    (event: 'expire'): void
}>()

const typeIcons: Record<Exclude<NotiType, 'charge'>, string> = {
    info: 'info-circle',
    error: 'times-circle',
    success: 'check-circle',
    pending: 'spinner',
}
</script>

<template>
    <div
        class="inline noti"
        :style="{
            '--duration': noti.duration ? noti.duration + 'ms' : undefined,
            ...noti.style
        }"
        :class="noti.type"
    >
        <fa-icon
            :icon="noti.type === 'charge' ? noti.icon : typeIcons[noti.type]"
            class="noti-type"
            :spin="noti.type === 'pending'"
        />
        <span>{{ noti.content }}</span>
        <div
            v-if="noti.duration"
            class="noti-lasting"
            @animationend="emit('expire')"
        >
            <div v-if="noti.type !== 'charge'" class="noti-lasting-inner"></div>
        </div>
    </div>
</template>

<style scoped>
.noti {
    padding: .5em 1em;
    margin: .5em 0;
    border-radius: .8rem;
    background-color: var(--color-bg);
    box-shadow: 0 0 .4em var(--color-shad-bg);
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

@keyframes noti-charge {
    from {
        background-size: 0% 100%;
    }
    to {
        background-size: 100% 100%;
    }
}

.noti-lasting {
    position: relative;
    top: .5em;
    left: -1em;
    height: 3px;
    width: calc(100% + 2em);
}
.noti:hover .noti-lasting-inner {
    animation-play-state: paused;
}

.noti-lasting-inner {
    height: 100%;
    background-color: var(--color-order);
    animation: var(--duration) linear forwards noti-progress;
}

.noti:hover {
    opacity: .5;
}

.noti-type {
    margin-right: .5em;
}
.info .noti-type {
    color: var(--color-order);
}
.error .noti-type {
    color: var(--color-wrong);
}
.success .noti-type {
    color: var(--color-correct);
}

.charge {
    width: 10em;
    max-width: 80%;
    color: var(--color-bg);
    background-color: var(--color-fg);

    background-repeat: no-repeat;
    background-image: linear-gradient(var(--color-order) 0%, var(--color-order) 100%);
    animation:
        var(--duration) linear forwards noti-charge,
        .3s hop var(--duration);
}
</style>
