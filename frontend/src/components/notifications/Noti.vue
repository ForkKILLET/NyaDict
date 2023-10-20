<script setup lang="ts">
import { ref } from 'vue'

import {
    getNotiId, removeNoti,
    type NotiAction, type Noti, type NotiType
} from '@util/notif'

const props = defineProps<{
    noti: Noti
}>()

const transparent = ref(false)

const remove = (cause?: string) => {
    removeNoti(getNotiId(props.noti), cause)
}

const onAnimationEnd = (event: AnimationEvent) => {
    switch (event.animationName.match(/^noti-(\w+?)-/)?.[1]) {
        case 'progress':
            props.noti.onExpire?.()
            remove('expire')
            break
        case 'charge':
            props.noti.onCharge?.()
            remove('charge')
            break
    }
}

const onClick = () => {
    if (props.noti.closable !== false) remove()
    else {
        transparent.value = ! transparent.value
    }
}

const handleAction = (action: NotiAction) => {
    const toClose = action.onClick() ?? true
    if (toClose) removeNoti(getNotiId(props.noti))
}

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
        :class="{
            [noti.type]: true,
            transparent
        }"
        @click="onClick"
        @animationend="onAnimationEnd"
    >
        <fa-icon
            :icon="noti.type === 'charge' ? noti.icon : typeIcons[noti.type]"
            class="noti-type"
            :spin="noti.type === 'pending'"
        />
        <span>
            {{ noti.content }}
            <template v-if="noti.actions">
                <br />
                <div
                    v-for="action of noti.actions"
                    class="noti-action badge"
                    :class="{ active: action.primary }"
                    @click.stop="handleAction(action)"
                >
                    {{ action.info }}
                </div>
            </template>
        </span>
        <div
            v-if="noti.duration"
            class="noti-lasting"
        >
            <div
                v-if="noti.type !== 'charge'"
                class="noti-lasting-inner"
                @animationend="onAnimationEnd"
            ></div>
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

.noti.transparent {
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
