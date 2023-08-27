<script setup lang="ts">
import { useWord } from '@store/words'

defineProps<{
    id: number
    disp?: string
    self?: boolean
    hideSelf?: boolean
}>()

const wordStore = useWord()
</script>

<template>
    <RouterLink
        :to="`/words?id=${id}`"
        class="word-link"
        :class="{ self, hidden: self && hideSelf }"
    >{{ disp ?? wordStore.getById(id)?.disp }}</RouterLink>
</template>

<style scoped>
.word-link.self {
    text-decoration: underline wavy;
}

.word-link.self.hidden {
    color: transparent;
    user-select: none;
    text-decoration-style: solid;
    text-decoration-color: var(--color-ui);
    pointer-events: none;
}
</style>
