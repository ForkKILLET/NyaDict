<script setup lang="ts">
import { computed } from 'vue'
import type { IMemMode, IMemory } from '../types'
import Correctness from './Correctness.vue'

const props = withDefaults(defineProps<{
    mem: IMemory
    memMode?: IMemMode
    showAcc?: boolean
}>(), {
    memMode: 'both'
})

const correctWrong = computed<{
    correct: number
    wrong: number
}>(() => props.mem.testRec
    .reduce((acc, rec) => {
        if (props.memMode === 'both' || props.memMode === rec.mode)
            acc[rec.correct ? 'correct' : 'wrong'] ++
        return acc
    }, {
        correct: 0,
        wrong: 0
    })
)
</script>

<template>
    <Correctness
        :correct="correctWrong.correct"
        :wrong="correctWrong.wrong"
        :show-acc="showAcc"
    />
</template>
