<script setup lang="ts">
import { ref } from 'vue'
import { useWords } from '../../stores/words'
import WordEditor from '../WordEditor.vue'
import type { IWord } from '../../types'

import WordList from '../WordList.vue'
import WordDetail from '../WordDetail.vue'

const wordsStore = useWords()

const currentWord = ref<IWord>()

type ToolbarMode = 'add' | 'search'
const toolbarMode = ref<ToolbarMode | null>(null)
const changeToolbarMode = (mode: ToolbarMode) => {
    toolbarMode.value = toolbarMode.value === mode ? null : mode
}

const toolbarConfig: Array<{
    icon: string,
    mode: ToolbarMode
}> = [
    { icon: 'circle-plus', mode: 'add' },
    // { icon: 'magnifying-glass', mode: 'search' }
]
</script>

<template>
    <div class="content">
        <div class="left">
            <div class="toolbar">
                <div class="toolbar-nav">
                    <fa-icon
                        v-for="conf of toolbarConfig"
                        @click="changeToolbarMode(conf.mode)"
                        class="button"
                        :icon="[ 'fas', conf.icon ]"
                    />
                </div>
                <div class="toolbar-main">
                    <WordEditor
                        v-if="toolbarMode === 'add'"
                        @change="word => wordsStore.add(word)"
                    />
                </div>
            </div>
            <WordList
                :active-word="currentWord"
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
.toolbar {
    margin: -.8em;
    padding: .8em;
    border-radius: .5em;
    background: #faad700a;
    box-shadow: 0 0 .2em #ffe6d14d;
}
.toolbar-nav {
    font-size: 1.2em;
}
.toolbar-nav > :first-child {
    margin: 0;
}
.toolbar-main > :first-child {
    margin-top: .5em;
}

.content {
    display: flex;
    height: calc(100vh - 3.5rem);
}

.left {
    flex-basis: 50%;
    padding: 1em 1.5em 0 1em;
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
