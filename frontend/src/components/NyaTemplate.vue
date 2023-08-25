<script setup lang="ts">
import { computed } from 'vue'
import WordLink from '@comp/WordLink.vue'
import { getTemplateSegements } from '@store/words'
import type { IWord } from '@type'

const props = defineProps<{
    text: string
    word: IWord
}>()

const segments = computed(() => getTemplateSegements(props.text))
</script>

<template>
    <span>
        <template v-for="seg of segments">
            <template v-if="(typeof seg === 'string')">{{ seg }}</template>
            <WordLink
                v-else
                :id="seg.id ?? word.id"
                :disp="seg.disp"
                :class="{ self: ! seg.id }"
            />
        </template>
    </span>
</template>

<style scoped>
.word-link.self {
    text-decoration: underline wavy;
}

.word-link + .word-link {
    margin-left: .2em;
}
</style>
