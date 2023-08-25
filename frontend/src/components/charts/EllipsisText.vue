<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<{
    text: string
    maxLength: number
}>()

const textEl = ref<SVGTextElement>()
const ellipsisText = ref('')

const waitForNextTick = () => new Promise<void>(res => nextTick(res))

onMounted(() => watch(props, async () => {
    if (! textEl.value) return
    let trimmedText = props.text

    ellipsisText.value = props.text
    await waitForNextTick()

    while (
        trimmedText.length > 1 &&
        textEl.value.getSubStringLength(0, ellipsisText.value.length) > props.maxLength
    ) {
        trimmedText = trimmedText.slice(0, - 1)
        ellipsisText.value = trimmedText + '...'
        await waitForNextTick()
    }
}, { immediate: true }))
</script>

<template>
    <text ref="textEl">{{ ellipsisText }}</text>
</template>
