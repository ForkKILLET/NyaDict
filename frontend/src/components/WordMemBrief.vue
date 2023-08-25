<script setup lang="ts">
import { computed } from 'vue'
import { MemMode, type IMemory } from '@type'
import Correctness from '@comp/Correctness.vue'

const props = withDefaults(defineProps<{
    mem: IMemory
    memMode?: MemMode
    showAcc?: boolean
    showEasiness?: boolean
    showCount: boolean
    showRing: boolean
}>(), {
    memMode: MemMode.All
})

const correctWrong = computed<{
    correct: number
    halfCorrect: number
    wrong: number
}>(() => props.mem.testRec
    .reduce((acc, rec) => {
        if (props.memMode === MemMode.All || props.memMode === rec.mode as number as MemMode) {
            const { correct } = rec
            if (correct === 1) acc.correct ++
            else if (correct === 0) acc.wrong ++
            else acc.halfCorrect ++
        }
        return acc
    }, {
        correct: 0,
        halfCorrect: 0,
        wrong: 0
    })
)
</script>

<template>
    <Correctness
        :correct="correctWrong.correct"
        :half-correct="correctWrong.halfCorrect"
        :wrong="correctWrong.wrong"
        :easiness="mem.easiness"
        :show-acc="showAcc"
        :show-easiness="showEasiness"
        :show-count="showCount"
        :show-ring="showRing"
    />
</template>
