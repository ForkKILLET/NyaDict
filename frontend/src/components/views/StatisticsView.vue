<script setup lang="ts">
import { useWords } from '@/stores/words'
import dayjs from 'dayjs'

import { gradeBy, gradeColors } from '@/utils'
import Calendar from '../charts/Calendar.vue'
import NyaDate from '../NyaDate.vue'
import StatisticsItem from '../StatisticsItem.vue'

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
    }
}
</script>

<template>
    <div class="content">
        <StatisticsItem
            title="単語作成"
            :data="data.createWord"
        >
            <template #default="{ data }">
                <Calendar
                    :start-day="data.firstDate.get('d')"
                    :data="data.data"
                    :colors="gradeColors"
                >
                    <template #current="{ value }">
                        <div v-if="value">
                            <NyaDate :date="value.date" />
                            に単語を
                            <span class="number">{{ value.num }}</span>
                            個作成した
                        </div>
                    </template>
                </Calendar>
            </template>
        </StatisticsItem>
    </div>
</template>

<style scoped>
.content {
    display: flex;
    padding: 0 1em;
    flex-flow: wrap;
}

.statistics-item {
    flex: 1;
    margin: 0 .5em;
    max-width: calc(50% - 1em);
}

.calendar:deep( .calendar-inner) {
    max-width: 50em;
    overflow-x: auto;
}
</style>