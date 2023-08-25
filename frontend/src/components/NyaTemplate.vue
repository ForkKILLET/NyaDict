<script setup lang="ts">
import { computed } from 'vue'
import WordLink from '@comp/WordLink.vue'
import { getTemplateSegements } from '@store/words'
import type { IWord } from '@type'

const props = defineProps<{
    text: string
    word: IWord
    hideSelf?: boolean
}>()

const segments = computed(() => getTemplateSegements(props.text))
</script>

<template>
    <span>
        <template v-for="seg, index of segments">
            <template v-if="(typeof seg === 'string')">{{ seg }}</template>
            <WordLink
                v-else
                :id="seg.id ?? word.id"
                :disp="seg.disp"
                :self="! seg.id"
                :hide-self="hideSelf"
                :class="{ adjacent: index && typeof segments[index - 1] === 'object' }"
            />
        </template>
    </span>
</template>

<style scoped>
.word-link.adjacent {
    margin-left: .2em;
}
</style>
