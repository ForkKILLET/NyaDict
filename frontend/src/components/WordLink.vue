<script setup lang="ts">
import { computed } from 'vue'
import { useWord } from '@store/words'

const props = defineProps<{
    id: number
    disp?: string
    self?: boolean
    hideSelf?: boolean
    short?: boolean
}>()

const wordStore = useWord()

const text = computed(() => {
    if (props.disp) return props.disp
    const word = wordStore.getById(props.id)
    if (! word) return `#${props.id}`
    if (props.short) return word.disp.split('・')[0]
    return word.disp
})
</script>

<template>
    <RouterLink
        :to="`/words?id=${id}`"
        class="word-link"
        :class="{ self, hidden: self && hideSelf }"
    >{{ text }}</RouterLink>
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
