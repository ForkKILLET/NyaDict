<script setup lang="ts">
import { ref } from 'vue'
import { useWord } from '@store/words'
import type { IWord } from '@type'

import Word from '@comp/Word.vue'
import WordEditor from '@comp/WordEditor.vue'

const props = defineProps<{
    word: IWord
    active: boolean
}>()

const emit = defineEmits<{
    (event: 'goto-word', word: IWord): void
}>()

const wordStore = useWord()

const editMode = ref(false)
const onChange = (newWord: Omit<IWord, 'id' | 'mem'>) => {
    wordStore.modify({ ...props.word, ...newWord })
    editMode.value = false
}
</script>

<template>
    <div class="word-entry">
        <Word v-show="! editMode" :word="word" :class="{ barber: active }">
            <fa-icon
                v-if="active"
                class="button"
                icon="pen-to-square"
                @click="editMode = true"
            />
            <fa-icon
                v-else
                class="button"
                icon="arrow-circle-right"
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
