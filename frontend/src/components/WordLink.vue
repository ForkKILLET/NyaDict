<script setup lang="ts">
import { useWord } from '@/stores/words'

defineProps<{
    id: number
    disp?: string
}>()

const wordStore = useWord()
</script>

<template>
    <RouterLink :to="`/words?id=${id}`">{{ disp ?? wordStore.getById(id)?.disp }}</RouterLink>
</template>
