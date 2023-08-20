<script setup lang="ts">
import { useWord } from '@store/words'

defineProps<{
    id: number
    disp?: string
}>()

const wordStore = useWord()
</script>

<template>
    <RouterLink
        :to="`/words?id=${id}`"
        class="word-link"
    >{{ disp ?? wordStore.getById(id)?.disp }}</RouterLink>
</template>
