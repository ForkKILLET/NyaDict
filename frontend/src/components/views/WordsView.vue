<script setup lang="ts">
import { computed, reactive, Ref, ref } from 'vue'
import { emptyMem, getCorrectness, useWords } from '../../stores/words'
import WordEditor from '../WordEditor.vue'
import type { IWord } from '../../types'

import WordList from '../WordList.vue'
import WordDetail from '../WordDetail.vue'

const wordsStore = useWords()

const currentWord = ref<IWord>()

type ToolbarMode = 'add' | 'sort'
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

const sortMethodInfo = {
    createTime: '作成時間',
    correctness: '正確率'
}
type SortMethod = keyof typeof sortMethodInfo
type SortDirection = 'up' | 'down'
const sortMethod = ref<SortMethod>('createTime')
const sortDirection = ref<SortDirection>('up')
const sortFunction = computed(() => (a: IWord, b: IWord) => {
    const { value: m } = sortMethod
    const delta =
        m === 'createTime' ? a.mem.createTime - b.mem.createTime :
        m === 'correctness' ? getCorrectness(a.mem) - getCorrectness(b.mem) :
        0
    return sortDirection.value === 'up' ? - delta : + delta
})
const sortedWords = computed(() => wordsStore.words.sort(sortFunction.value))
const onSortMethodClick = (method: SortMethod) => {
    if (method === sortMethod.value)
        sortDirection.value = sortDirection.value === 'up' ? 'down' : 'up'
    else
        sortMethod.value = method
}

const toolbarConfig: ToolbarConfigItem[] = reactive([
    {
        mode: 'add',
        icon: 'circle-plus'
    },
    {
        mode: 'sort',
        icon: 'sort'
    } 
])

const recentlyAddedWordId = ref<number>()
const addWord = (word: Omit<IWord, 'id' | 'mem'>) => {
    const id = wordsStore.add({ ...word, mem: emptyMem() })
    recentlyAddedWordId.value = id
}
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
                        @change="addWord"
                    />
                    <div v-else-if="toolbarMode === 'sort'">
                        <span
                            v-for="methodInfo, method in sortMethodInfo"
                            @click="onSortMethodClick(method)"
                            class="sort-method"
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
                </div>
            </div>
            <WordList
                :active-word-id="currentWord?.id"
                :recently-added-word-id="recentlyAddedWordId"
                :words="sortedWords"
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

.sort-method {
    margin: 0 .3em;
    padding: .2em .3em;
    border-radius: .4em;
    box-shadow: 0 0 .4em #faad704d;
    cursor: pointer;
    user-select: none;
    transition: .3s background-color;
}
.sort-method:hover {
    background-color: #fff;
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
