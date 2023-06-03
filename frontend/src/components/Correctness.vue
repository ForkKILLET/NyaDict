<script setup lang="ts">
defineProps<{
    correct: number,
    wrong: number
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
</template>

<style scoped>
.number {
    padding: 0 .5em;
}
.number > span {
    margin-left: .2em;
}
</style>
