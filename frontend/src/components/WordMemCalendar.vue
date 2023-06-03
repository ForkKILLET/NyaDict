<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'
import type { IMemory } from '../types'

const props = defineProps<{
    mem: IMemory
}>()

type DayState = 'none' | 'idle' | 'correct' | 'wrong' | 'both'

const createDay = computed(() => dayjs(props.mem.createTime).startOf('day'))
const startDay = computed(() => {
    const today = dayjs().startOf('day')
    const totalDays = today.diff(createDay.value, 'day') + 1
    if (totalDays < 14)
        return createDay.value.subtract(14 - totalDays, 'day')
    return createDay.value
})

const days = computed(() => {
    const today = dayjs()
    const dates = []
    const days: Record<number, DayState> = {}
    for (
        let day = startDay.value;
        ! day.isAfter(today, 'day');
        day = day.add(1, 'day')
    ) {
        const date = + day.startOf('day')
        days[date] = day.isBefore(createDay.value) ? 'none' : 'idle'
        dates.push(date)
    }
    for (const rec of props.mem.testRec) {
        const date = + dayjs(rec.time).startOf('day')
        const state = rec.correct ? 'correct' : 'wrong'
        if (days[date] === 'idle') days[date] = state
        else if (days[date] !== state) days[date] = 'both'
    }
    return dates.map(date => days[date])
})
</script>

<template>
    <div class="calendar">
        <div class="calendar-title" v-for="text of [...'日月火水木金土']">{{ text }}</div>
        <div class="pad" :style="{ width: '1em', height: startDay.day() + 'em' }"></div>
        <div v-for="day of days" class="calendar-day" :class="day"></div>
    </div>
</template>

<style scoped>
.calendar {
    display: flex;
    flex-direction: column;
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
.calendar-day.none {
    background-color: #eee;
}
.calendar-day.idle {
    background-color: #aaa;
}
.calendar-day.correct {
    background-color: #95e35d;
}
.calendar-day.wrong {
    background-color: #ec4e1e;
}
.calendar-day.both {
    background: linear-gradient(-45deg, #95e35d 50%, #ec4e1e 50%);;
}
</style>
