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

const editMode = ref(false)
const onChange = (newWord: Omit<IWord, 'id' | 'mem'>) => {
    wordsStore.modify({ ...props.word, ...newWord })
    editMode.value = false
}

const wordsStore = useWords()
</script>

<template>
    <div class="word-list-entry">
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
