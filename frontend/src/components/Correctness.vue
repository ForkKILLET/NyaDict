<script setup lang="ts">
defineProps<{
    correct: number
    wrong: number
    showAcc?: boolean
}>()
</script>

<template>
    <span class="correct number">
        <fa-icon icon="fa-solid fa-check-circle" />
        <span>{{ correct }}</span>
    </span>
    <span class="wrong number">
        <fa-icon icon="fa-solid fa-times-circle" />
        <span>{{ wrong }}</span>
    </span>
    <span v-if="showAcc" class="number">{{
        (correct + wrong)
            ? (correct / (correct + wrong) * 100).toFixed(2) + '%'
            : 'N/A'
    }}</span>
</template>

<style scoped>
.number {
    padding: 0 .4rem;
}
.number > span {
    margin-left: .2em;
}
</style>
