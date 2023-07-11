<script setup lang="ts">
import { useWords } from '@/stores/words'
import dayjs from 'dayjs'
import { interpolateRgb } from 'd3-interpolate'

import { gradeBy, gradeColors } from '@/utils'
import NyaDate from '@comp/NyaDate.vue'
import StatisticsItem from '@comp/StatisticsItem.vue'
import Calendar from '@comp/charts/Calendar.vue'
import PieChart, { PieData } from '@comp/charts/PieChart.vue'

const wordsStore = useWords()

const data = {
    createWord: () => {
        const today = dayjs()

        const dates = []
        const nums: Record<string, number> = {}
        let firstDate: number = Infinity
        let maxCreateNum = 0

        wordsStore.words.forEach((word) => {
            const date = + dayjs(word.mem.createTime).startOf('d')
            if (date < firstDate) firstDate = date
            nums[date] ??= 0
            if (++ nums[date] > maxCreateNum) maxCreateNum = nums[date]
        })

        for (
            let day = dayjs(firstDate);
            ! day.isAfter(today, 'd');
            day = day.add(1, 'd')
        ) {
            const date = + day.startOf('d')
            dates.push(date)
        }

        const data = dates
            .map(date => {
                const num = nums[date]
                return {
                    kind: gradeBy(num, maxCreateNum),
                    value: {
                        num,
                        date
                    }
                }
            })
        return {
            firstDate: dayjs(firstDate),
            data
        }
    },
    easiness: () => {
        const { words } = wordsStore
        const total = words.length
        const groups: Record<string, number> = {}
        words.forEach(word => {
            const easiness = (word.mem.easiness ?? 0).toFixed(2)
            groups[easiness] ??= 0
            groups[easiness] ++
        })

        const interpolate = interpolateRgb('#ec4e1e', '#95e35d')
        const data: PieData = Object.entries(groups)
            .map(([ easiness, value ]) => ({
                ratio: value / total,
                value,
                name: easiness,
                color: ''
            }))
            .sort((a, b) => + b.name - + a.name)
        const maxEasiness = + data[0].name
        const minEasiness = + data.at(-1)!.name
        const deltaEasiness = maxEasiness - minEasiness
        data.forEach(item => {
            item.color = interpolate(+ item.name / deltaEasiness)
        })
        return { data }
    }
}
</script>

<template>
    <div class="content">
        <StatisticsItem
            title="単語作成"
            :data="data.createWord"
        >
            <template #default="{ data: { data, firstDate } }">
                <Calendar
                    :start-day="firstDate.get('d')"
                    :data="data"
                    :colors="gradeColors"
                >
                    <template #current="{ value }">
                        <div v-if="value">
                            <NyaDate :date="value.date" />
                            に単語を
                            <span class="number">{{ value.num ?? 0 }}</span>
                            個作成しました
                        </div>
                    </template>
                </Calendar>
            </template>
        </StatisticsItem>

        <StatisticsItem
            title="EZ 分布"
            :data="data.easiness"
        >
            <template #default="{ data: { data } }">
                <PieChart :data="data" />
            </template>
        </StatisticsItem>
    </div>
</template>

<style scoped>
.content {
    display: flex;
    flex-flow: wrap;
    padding: 0 1em;
}

.statistics-item {
    flex: 1;
    margin: 0 .5em 1em .5em;
    min-width: 320px;
    max-width: calc(50% - 1em);
}


.calendar:deep(> .calendar-inner) {
    max-width: 50em;
    overflow-x: auto;
}
</style>
