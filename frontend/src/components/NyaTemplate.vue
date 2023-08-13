<script setup lang="ts">
import { computed } from 'vue'
import WordLink from '@comp/WordLink.vue'
import { getTemplateSegement } from '@/stores/words'
import type { IWord } from '@type'

const props = defineProps<{
    text: string
    word: IWord
}>()

const segments = computed(() => getTemplateSegement(props.text))
</script>

<template>
    <span>
        <template v-for="seg of segments">
            <template v-if="(typeof seg === 'string')">{{ seg }}</template>
            <WordLink v-else :id="seg.id ?? word.id" :disp="seg.disp" />
        </template>
    </span>
</template>
