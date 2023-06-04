<script setup lang="ts">
import dayjs from 'dayjs'

defineProps<{
    date: number
}>()
</script>

<template>
    <span class="number" :title="dayjs(date).format('YYYY-MM-DD hh:mm:ss')">{{
        dayjs(date).format('YYYY-MM-DD')
    }}</span>
</template>
