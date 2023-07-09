<script setup lang="ts">
import { computed } from 'vue'
import type { IMemMode, IMemory } from '@type'
import Correctness from '@comp/Correctness.vue'

const props = withDefaults(defineProps<{
    mem: IMemory
    memMode?: IMemMode
    showAcc?: boolean
    showEasiness?: boolean
    showCount: boolean
    showRing: boolean
}>(), {
    memMode: 'both'
})

const correctWrong = computed<{
    correct: number
    halfCorrect: number
    wrong: number
}>(() => props.mem.testRec
    .reduce((acc, rec) => {
        if (props.memMode === 'both' || props.memMode === rec.mode) {
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
