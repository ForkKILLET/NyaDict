<script setup lang="ts" generic="T">
import { ref } from 'vue'

defineProps<{
    startDay: number
    data: Array<{
        kind: string
        value?: T
    }>
    colors: Record<string, string>
}>()

const currentIndex = ref<number>()
const currentValue = ref<T | undefined>()
</script>

<template>
    <div class="calendar">
        <div class="calendar-inner">
            <div class="calendar-title" v-for="text of [...'日月火水木金土']">{{ text }}</div>
            <div class="pad" :style="{ width: '1em', height: startDay + 'em' }"></div>
            <div
                v-for="{ kind, value }, index of data"
                class="calendar-day"
                @mouseover="currentIndex = index; currentValue = value"
                :style="{ background: colors[kind] ?? '#eee' }"
                :class="{ current: index === currentIndex }"
            ></div>
        </div>
        <slot name="current" :value="currentValue"></slot>
    </div>
</template>

<style scoped>
.calendar-inner {
    display: flex;
    flex-flow: column;
    flex-wrap: wrap;
    align-content: start;
    height: 7em;
}
.calendar-title {
    font-size: .7em;
    line-height: 1;
}
.calendar-day, .calendar-title {
    width: .8rem;
    height: .8rem;
    border-radius: .2rem;
    margin: .1rem;
}
.calendar-day.current {
    outline: 2px solid #db8e3090;
}
</style>