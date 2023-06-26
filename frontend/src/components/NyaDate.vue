<script setup lang="ts">
import dayjs from 'dayjs'

defineProps<{
    date: number
    long?: boolean
}>()
</script>

<template>
    <span class="number" :title="dayjs(date).format('YYYY-MM-DD hh:mm:ss')">{{
        dayjs(date).format('YYYY-MM-DD' + (long ? ' hh:mm:ss' : ''))
    }}</span>
</template>
