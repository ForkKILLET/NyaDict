<script setup lang="ts">
import { computed } from 'vue'
import WordLink from '@comp/WordLink.vue'
import type { IWord } from '@type'

const props = defineProps<{
    text: string
    word: IWord
}>()

const segments = computed(() => props.text
    .split(/(#\d*\([^)]+?\)|#\d*)/)
    .map(seg => {
        if (seg[0] === '#') {
            const { id, disp } = seg.match(/#(?<id>\d+)?(\((?<disp>[^)]+?)\))?/)!.groups as { id?: string, disp?: string }
            return { id: id ? + id : undefined, disp }
        }
        return seg
    })
)
</script>

<template>
    <span>
        <template v-for="seg of segments">
            <template v-if="(typeof seg === 'string')">{{ seg }}</template>
            <WordLink v-else :id="seg.id ?? word.id" :disp="seg.disp" />
        </template>
    </span>
</template>
