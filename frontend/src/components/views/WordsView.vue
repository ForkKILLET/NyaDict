<script setup lang="ts">
import { ref } from 'vue'
import { useWords } from '../../stores/words'
import WordAdder from '../WordAdder.vue'
import type { IWord } from '../../types/data'

import WordList from '../WordList.vue'
import WordDetail from '../WordDetail.vue'

const wordsStore = useWords()

const currentWord = ref<IWord>()
</script>

<template>
    <div class="content">
        <div class="left">
            <WordAdder @add="(word) => wordsStore.add(word)" />
            <WordList
                :words="wordsStore.words"
                @goto-word="word => currentWord = word"
            />
        </div>
        <WordDetail
            v-if="currentWord"
            :word="currentWord"
        />
    </div>
</template>

<style scoped>
.content {
    display: flex;
    height: calc(100vh - 6em);
}

.left {
    flex-basis: 50%;
    padding: 1em;
    overflow-y: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
}
.left::-webkit-scrollbar {
    display: none;
}

.word-detail {
    flex: 1;
}
</style>
