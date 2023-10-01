<script setup lang="ts">
import LongPressButton from '@comp/LongPressButton.vue'

import type { IWordDocument } from '@type'

const props = defineProps<{
    doc: IWordDocument
}>()

const toggleImportant = () => {
    const labels = props.doc.labels ??= {}
    labels.i = ! labels.i // `i` = important
}
</script>

<template>
    <LongPressButton
        @long-press="toggleImportant"
        icon="star"
        :color="`var(${doc.labels?.i ? '--color-order' : '--color-fg'})`"
        desc="マーク"
        :delay="0.5"
    />
</template>
