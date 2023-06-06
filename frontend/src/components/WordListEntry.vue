<script setup lang="ts">
import { ref } from 'vue'
import { useWords } from '../stores/words'
import type { IWord } from '../types'

import Word from './Word.vue'
import WordEditor from './WordEditor.vue'

const props = defineProps<{
    word: IWord
    active: boolean
}>()

const emit = defineEmits<{
    (event: 'goto-word', word: IWord): void
}>()

const wordsStore = useWords()

const editMode = ref(false)
const onChange = (newWord: Omit<IWord, 'id' | 'mem'>) => {
    wordsStore.modify({ ...props.word, ...newWord })
    editMode.value = false
}
</script>

<template>
    <div class="word-list-entry" :class="{ active }">
        <Word v-show="! editMode" :word="word">
            <fa-icon
                v-if="active"
                class="button"
                icon="fa-solid fa-pen-to-square"
                @click="editMode = true"
            />
            <fa-icon
                v-else
                class="button"
                icon="fa-solid fa-arrow-circle-right"
                @click="emit('goto-word', word)"
            />
        </Word>
        <WordEditor
            v-show="editMode"
            :word="word"
            @change="onChange"
            @cancel="editMode = false"
        />
    </div>
</template>

<style scoped>
@keyframes barber {
    from {
        background-position-x: 0;
    }
    to {
        background-position-x: 25px;
    }
}
.word-list-entry.active > .card {
    background-image: linear-gradient(
        -45deg,
        #fff 0, #fff 25%, #fffaf6 25%, #fffaf6 50%,
        #fff 50%, #fff 75%, #fffaf6 75%, #fffaf6 100%
    );
    background-size: 25px 25px;

    animation: barber .5s linear infinite;
}
</style>
