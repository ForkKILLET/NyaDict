<script setup lang="ts">
import { computed, reactive, Ref, ref } from 'vue'
import {
    emptyMem, getCorrectness, getYomikataIndex,
    getRomaji, getLastTestTime, useWords,
} from '@store/words'
import { storeRef } from '@util/storage'
import type { IWord } from '@type'

import WordEditor from '@comp/WordEditor.vue'
import WordList from '@comp/WordList.vue'
import WordDetail from '@comp/WordDetail.vue'
import { add as addNoti } from '@/utils/notif'

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
    if (! pat) return [...wordsStore.words]
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
    testTime: 'テスト時間',
    easiness: 'EZ'
}
type SortMethod = keyof typeof sortMethodInfo
type SortDirection = 'up' | 'down'
const sortMethod = storeRef<SortMethod>('wordsSortMethod', 'createTime')
const sortDirection = storeRef<SortDirection>('wordsSortDirection', 'up')
const sortFunction = computed(() => {
    const { value: method } = sortMethod
    return (a: IWord, b: IWord) => {
        const delta =
            method === 'createTime' ? a.mem.createTime - b.mem.createTime :
            method === 'acc' ? getCorrectness(a.mem) - getCorrectness(b.mem) :
            method === 'correctCount' ? a.mem.correctCount - b.mem.correctCount :
            method === 'wrongCount' ? a.mem.wrongCount - b.mem.wrongCount :
            method === 'halfCorrectCount' ? a.mem.halfCorrectCount - b.mem.halfCorrectCount :
            method === 'yomikata' ? getYomikataIndex(b) - getYomikataIndex(a) :
            method === 'testTime' ? getLastTestTime(a) - getLastTestTime(b) :
            method === 'easiness' ? a.mem.easiness - b.mem.easiness :
            0
        return sortDirection.value === 'up' ? - delta : + delta
    }
})
const sortedWords = computed(() => [...filteredWords.value].sort(sortFunction.value))
const onSortMethodClick = (method: SortMethod) => {
    if (method === sortMethod.value)
        sortDirection.value = sortDirection.value === 'up' ? 'down' : 'up'
    else
        sortMethod.value = method
}

const addWord = (word: Omit<IWord, 'id' | 'mem'>) => {
    if (! word.disp || ! word.sub) {
        addNoti({
            type: 'error',
            content: '単語の書き方と読み方を入力ください',
            duration: 2 * 1000
        })
        return
    }

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
                    <div v-else-if="toolbarMode === 'filter'" class="filter">
                        <input v-model="searchText" class="card up search" />
                        <fa-icon
                            @click="searchText = ''"
                            icon="times-circle"
                            class="button"
                        />
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
    margin: -.8em;
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
    box-sizing: border-box;
}

.left {
    display: flex;
    flex-flow: column;
    box-sizing: border-box;
    flex-basis: 50%;
    min-width: 20em;
    padding: 1.2em 1em 0 1em;
}

.right {
    box-sizing: border-box;
}

@media screen and (orientation: portrait) and (max-device-width: 600px) {
	.left {
        flex-basis: calc(100vw - 1em);
        flex-grow: 0;
        flex-shrink: 0;
        padding-left: 0;
	}
    .right {
        flex-basis: calc(100vw - .5em);
        flex-grow: 0;
        flex-shrink: 0;
        padding-left: 1em;
    }
}

.word-list::-webkit-scrollbar {
    display: none;
}

input.search {
    width: calc(100% - 1.6em);
    font-family: serif;
    font-size: 1rem;
    padding: .2em .5em;
}

.filter {
    display: flex;
    align-items: center;
}

.filter > input {
    font-family: var(--ja-serif);
}
</style>
