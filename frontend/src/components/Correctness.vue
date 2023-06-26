<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
    correct: number
    halfCorrect: number
    wrong: number
    showAcc?: boolean
    showHalfCorrect?: boolean
}>()

const total = computed(() => props.correct + props.halfCorrect + props.wrong)
</script>

<template>
    <span class="correct number">
        <fa-icon icon="check-circle" />
        <span>{{ showHalfCorrect ? correct : correct + halfCorrect }}</span>
    </span>
    <span v-if="showHalfCorrect" class="half-correct number">
        <fa-icon icon="circle-question" />
        <span>{{ halfCorrect }}</span>
    </span>
    <span class="wrong number">
        <fa-icon icon="times-circle" />
        <span>{{ wrong }}</span>
    </span>
    <span v-if="showAcc" class="number">
        {{ total
            ? ((1 - wrong / total) * 100).toFixed(2) + '%'
            : 'N/A'
        }}
    </span>
</template>

<style scoped>
.number {
    padding: 0 .4rem;
}
.number > span {
    margin-left: .2em;
}
</style>
