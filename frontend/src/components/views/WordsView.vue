<script setup lang="ts">
import { computed, reactive, Ref, ref } from 'vue'
import {
    emptyMem, getCorrectness, getYomikataIndex,
    getRomaji, getLastTestTime, useWords,
} from '@store/words'
import type { IWord } from '../../types'
import WordEditor from '../WordEditor.vue'
import WordList from '../WordList.vue'
import WordDetail from '../WordDetail.vue'
import { storageRef } from '../../utils/storage'

const wordsStore = useWords()

const currentWord = ref<IWord>()

type ToolbarMode = 'add' | 'sort' | 'filter'
const toolbarMode = ref<ToolbarMode | null>(null)
const changeToolbarMode = (mode: ToolbarMode) => {
    toolbarMode.value = toolbarMode.value === mode ? null : mode
    const item = toolbarConfig.find(i => i.mode === mode)!
    item.action?.(item)
}
type ToolbarConfigItem = {
    icon: string | Ref<string>
    mode: ToolbarMode
    action?: (item: ToolbarConfigItem) => void
}
const toolbarConfig = reactive<ToolbarConfigItem[]>([
    {
        mode: 'add',
        icon: 'circle-plus'
    },
    {
        mode: 'sort',
        icon: 'sort'
    },
    {
        mode: 'filter',
        icon: 'filter'
    }
])

const searchText = ref('')
const filteredWords = computed<IWord[]>(() => {
    const pat = searchText.value
    if (! pat) return wordsStore.words
    return wordsStore.words.filter(word => (
        word.disp.includes(pat) || word.sub.includes(pat) ||
        getRomaji(word).includes(pat)
    ))
})

const sortMethodInfo = {
    createTime: '作成時間',
    acc: '正確率',
    correctCount: 'パス数',
    wrongCount: 'ミス数',
    halfCorrectCount: 'ハーフパス数',
    yomikata: '読み方',
    testTime: 'テスト時間'
}
type SortMethod = keyof typeof sortMethodInfo
type SortDirection = 'up' | 'down'
const sortMethod = storageRef<SortMethod>('wordsSortMethod', 'createTime')
const sortDirection = storageRef<SortDirection>('wordsSortDirection', 'up')
const sortFunction = computed(() => (a: IWord, b: IWord) => {
    const { value: method } = sortMethod
    const delta =
        method === 'createTime' ? a.mem.createTime - b.mem.createTime :
        method === 'acc' ? getCorrectness(a.mem) - getCorrectness(b.mem) :
        method === 'correctCount' ? a.mem.correctCount - b.mem.correctCount :
        method === 'wrongCount' ? a.mem.wrongCount - b.mem.wrongCount :
        method === 'halfCorrectCount' ? a.mem.halfCorrectCount - b.mem.halfCorrectCount :
        method === 'yomikata' ? getYomikataIndex(b) - getYomikataIndex(a) :
        method === 'testTime' ? getLastTestTime(a) - getLastTestTime(b) :
        0
    return sortDirection.value === 'up' ? - delta : + delta
})
const sortedWords = computed(() => filteredWords.value.sort(sortFunction.value))
const onSortMethodClick = (method: SortMethod) => {
    if (method === sortMethod.value)
        sortDirection.value = sortDirection.value === 'up' ? 'down' : 'up'
    else
        sortMethod.value = method
}

const addWord = (word: Omit<IWord, 'id' | 'mem'>) => {
    const id = wordsStore.add({ ...word, mem: emptyMem() })
    currentWord.value = wordsStore.getById(id)
}
</script>

<template>
    <div class="content">
        <div class="left">
            <div class="glowing toolbar">
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
                        @change="addWord"
                    />
                    <div v-else-if="toolbarMode === 'sort'" class="sort-methods">
                        <span
                            v-for="methodInfo, method in sortMethodInfo"
                            @click="onSortMethodClick(method)"
                            class="badge"
                        >
                            {{ methodInfo }}
                            <fa-icon
                                class="button"
                                :icon="method === sortMethod ? 'sort-' + sortDirection : 'sort'"
                            />
                        </span>
                    </div>
                    <div v-else-if="toolbarMode === 'filter'">
                        <input v-model="searchText" class="card up search" />
                    </div>
                </div>
            </div>
            <WordList
                :active-word-id="currentWord?.id"
                :words="sortedWords"
                @goto-word="(word: IWord) => currentWord = word"
            />
        </div>
        <WordDetail
            v-if="currentWord"
            class="right"
            :word="currentWord"
        />
    </div>
</template>

<style scoped>
.toolbar {
    margin-bottom: .5em;
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

.sort-methods {
    display: flex;
    flex-wrap: wrap;
}

.content {
    display: flex;
    height: calc(100vh - 3.5rem);
}

.left {
    display: flex;
    flex-flow: column;
    flex-basis: 50%;
    padding: 1.2em 1.5em 0 1em;
}

.word-list::-webkit-scrollbar {
    display: none;
}

.word-detail {
    flex: 1;
}

input.search {
    width: calc(100% - 1.6em);
    font-family: serif;
    font-size: 1rem;
    padding: .2em .5em;
}
</style>
