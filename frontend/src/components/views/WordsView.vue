<script setup lang="ts">
import { computed, reactive, Ref, ref } from 'vue'
import { emptyMem, getCorrectness, getYomikataIndex, getRomaji, useWords } from '../../stores/words'
import type { IWord } from '../../types'
import WordEditor from '../WordEditor.vue'
import WordList from '../WordList.vue'
import WordDetail from '../WordDetail.vue'

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
    id: 'ID',
    yomikata: '読み方'
}
type SortMethod = keyof typeof sortMethodInfo
type SortDirection = 'up' | 'down'
const sortMethod = ref<SortMethod>('createTime')
const sortDirection = ref<SortDirection>('up')
const sortFunction = computed(() => (a: IWord, b: IWord) => {
    const { value: m } = sortMethod
    const delta =
        m === 'createTime' ? a.mem.createTime - b.mem.createTime :
        m === 'acc' ? getCorrectness(a.mem) - getCorrectness(b.mem) :
        m === 'correctCount' ? a.mem.correctNum - b.mem.correctNum :
        m === 'wrongCount' ? a.mem.wrongNum - b.mem.wrongNum :
        m === 'id' ? a.id - b.id :
        m === 'yomikata' ? getYomikataIndex(b) - getYomikataIndex(a) :
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
                                :icon="[
                                    'fas',
                                    method === sortMethod ? 'sort-' + sortDirection : 'sort'
                                ]"
                            />
                        </span>
                    </div>
                    <div v-else-if="toolbarMode === 'filter'">
                        <input v-model="searchText" class="card search" />
                    </div>
                </div>
            </div>
            <WordList
                :active-word-id="currentWord?.id"
                :words="sortedWords"
                @goto-word="word => currentWord = word"
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
    margin-bottom: 2em;
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
    height: calc(100vh - 3.5rem - 1em);
}

.left {
    display: flex;
    flex-direction: column;
    flex-basis: 50%;
    padding: 1.2em 1.5em 0 1em;
}

.word-list {
    flex: 1;
    overflow-y: scroll;
    scrollbar-width: none;
    margin: -1em -.5em;
    padding: 1em .5em;
}
.word-list::-webkit-scrollbar {
    display: none;
}

.word-detail {
    flex: 1;
    position: sticky;
    top: 0;
}

input.search {
    width: calc(100% - 1.6em);
}
</style>
