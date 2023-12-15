<script setup lang="ts">
import { computed, ref } from 'vue'
import dayjs from 'dayjs'

import WordMemBrief from '@comp/WordMemBrief.vue'
import Calendar from '@comp/charts/Calendar.vue'
import NyaDate from '@comp/NyaDate.vue'

import { MemMode, type IMemory, type ITestRec } from '@type'

const props = defineProps<{
    mem: IMemory
}>()

const calendarMode = ref(MemMode.All)
const calendarModeInfo: Record<MemMode, string> = {
    [MemMode.Disp]: '書き方',
    [MemMode.Sub]: '読み方',
    [MemMode.Meaning]: '解釈',
    [MemMode.All]: '合計'
}

type DayState = 'none' | 'idle' | 'correct' | 'wrong' | 'both' | 'half-correct'

const createDay = computed(() => dayjs(props.mem.createTime).startOf('d'))
const startDate = computed(() => {
    const today = dayjs().startOf('d')
    const totalDays = today.diff(createDay.value, 'd') + 1
    if (totalDays < 14)
        return createDay.value.subtract(14 - totalDays, 'd')
    return createDay.value
})

const data = computed(() => {
    const today = dayjs()
    const dates = []
    const data: Record<number, { state: DayState, recs: ITestRec[] }> = {}
    for (
        let day = startDate.value;
        ! day.isAfter(today, 'd');
        day = day.add(1, 'd')
    ) {
        const date = + day.startOf('d')
        data[date] = { state: day.isBefore(createDay.value) ? 'none' : 'idle', recs: [] }
        dates.push(date)
    }
    for (const rec of props.mem.testRec) {
        if (calendarMode.value !== MemMode.All && calendarMode.value !== rec.mode as number as MemMode) continue

        const date = + dayjs(rec.time).startOf('d')
        const state = rec.correct === 1 ? 'correct' : rec.correct === 0 ? 'wrong' : 'half-correct'
        const item = data[date]
        item.recs.push(rec)
        if (item.state === 'idle') item.state = state
        else if (item.state !== state) item.state = 'both'
    }
    return dates.map(date => ({
        kind: data[date].state,
        date: dayjs(date),
        value: {
            recs: data[date].recs
        }
    }))
})
</script>

<template>
    <div class="glowing calendar">
        <div class="calendar-modes">
            <span
                v-for="modeInfo, mode in calendarModeInfo"
                class="badge"
                :class="{ active: calendarMode === + mode }"
                @click="calendarMode = + mode"
            >{{ modeInfo }}</span>
        </div>
        <WordMemBrief
            :mem="mem"
            :show-acc="true"
            :show-easiness="true"
            :mem-mode="calendarMode"
            :show-count="true"
            :show-ring="true"
        />
        <Calendar
            :start-day="startDate.day()"
            :has-count="false"
            :data="data"
            :colors="{
                idle: '#aaa',
                correct: 'var(--color-correct)',
                'half-correct': 'var(--color-half-correct)',
                wrong: 'var(--color-wrong)',
                both: 'linear-gradient(-45deg, var(--color-correct) 50%, var(--color-wrong) 50%)'
            }"
        >
            <template #current="{ item }">
                <template v-if="item">
                    <NyaDate :date="item.date" />

                    <template v-for="rec of item.value.recs">
                        <span
                            v-if="rec.testId !== undefined"
                            class="rec-id id"
                        >{{ rec.testId }}</span>
                    </template>
                </template>
                <div
                    v-else
                    class="no-current"
                />
            </template>
        </Calendar>
    </div>
</template>

<style scoped>
.calendar-modes {
    white-space: nowrap;
    margin-bottom: .5em;
}

.no-current {
    height: 1em;
}

.rec-id {
    margin-left: .3em;
}
</style>
