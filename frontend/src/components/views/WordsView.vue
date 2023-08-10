<script setup lang="ts">
import { computed, reactive, ref, toRefs, watch, type Ref, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import {
    emptyMem, getCorrectness, getYomikataIndex,
    getRomaji, getLastTestTime, useWord
} from '@store/words'
import { useTest } from '@/stores/test'
import { isPortrait } from '@/utils/media'
import { storeRef } from '@util/storage'
import WordEditor from '@comp/WordEditor.vue'
import WordList from '@comp/WordList.vue'
import WordDetail from '@comp/WordDetail.vue'
import type { IWord } from '@type'
import { ITestRec } from '@type'
import { useDebounceFn } from '@vueuse/core'

const wordStore = useWord()
const testStore = useTest()

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

const { search, testId, testCorrectLevel } = toRefs(wordStore.filter)

const updateSearch = useDebounceFn((v: string) => {
    search.value = v
}, 300)
const searchDebounced = computed<string>({
    get: () => search.value ?? '',
    set: updateSearch
})

watch(testId, () => {
    if (search.value || testId.value) toolbarMode.value = 'filter'
}, { immediate: true })

const filteredWords = computed<IWord[]>(() => {
    let words = [...wordStore.words]
    let recs: ITestRec[] = []
    if (testId.value !== null) {
        const test = testStore.getById(testId.value)
        if (! test) return []
        words = test.wordIds.map((id, index) => {
            const word = wordStore.getById(id)!
            recs[index] = word.mem.testRec[test.recIds[index]]
            return word
        })
    }

    const text = search?.value
    return words.filter((word, index) => (
        ! text || word.disp.includes(text) || word.sub.includes(text) ||
        getRomaji(word).includes(text)
    ) && (
        testId.value === null || recs[index].correct <= testCorrectLevel.value
    ))
})

const sortMethodInfo = {
    id: 'ID',
    createTime: '作成時間',
    acc: '正確率',
    correctCount: 'パス数',
    wrongCount: 'ミス数',
    halfCorrectCount: 'あやふや数',
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
            method === 'id' ? b.id - a.id :
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
    const id = wordStore.add({ ...word, mem: emptyMem() })
    currentWord.value = wordStore.getById(id)
}

const contentEl = ref<HTMLDivElement>()

const gotoWord = (word: IWord) => {
    currentWord.value = word
    if (isPortrait.value) nextTick(() => {
        contentEl.value?.scrollBy({ left: window.innerHeight, behavior: 'smooth' })
    })
}

const route = useRoute()
const currentWordBeforeQuerying = ref<IWord>()

watch(route, () => {
    const { id } = route.query
    if (typeof id === 'string' && id) {
        const queryingWord = wordStore.getById(+ id)
        if (queryingWord) {
            currentWordBeforeQuerying.value = currentWord.value
            currentWord.value = queryingWord
        }
    }
    else if (currentWordBeforeQuerying.value) {
        currentWord.value = currentWordBeforeQuerying.value
    }
}, { immediate: true })
</script>

<template>
    <div class="content scroll-x" ref="contentEl">
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
                        <div class="filter-search">
                            <input v-model="searchDebounced" class="card light" />
                            <fa-icon
                                @click="search = ''"
                                icon="times-circle" class="button"
                            />
                        </div>
                        <span v-if="testId" class="filter-test badge">
                            テスト <span class="id">{{ testId }}</span>
                            <fa-icon
                                @click="testCorrectLevel = (testCorrectLevel + 0.5) % 1.5"
                                :icon="
                                    testCorrectLevel === 1 ? 'check-circle' :
                                    testCorrectLevel === 0 ? 'times-circle' :
                                    'question-circle'
                                "
                                class="button no-hover"
                                :class="
                                    testCorrectLevel === 1 ? 'correct' :
                                    testCorrectLevel === 0 ? 'wrong' :
                                    'half-correct'
                                "
                            />
                            <fa-icon
                                @click="testId = null"
                                icon="trash" class="button"
                            />
                        </span>
                    </div>
                </div>
            </div>
            <WordList
                :active-word-id="currentWord?.id"
                :words="sortedWords"
                @goto-word="gotoWord"
                class="scroll-y"
            />
        </div>
        <WordDetail
            v-if="currentWord"
            :word="currentWord"
            class="right scroll-y"
        />
    </div>
</template>

<style scoped>
.content {
    display: flex;
    height: 100%;
    margin: 0 -1em;
}

.left {
    flex-basis: 50%;
    min-width: 20em;

    display: flex;
    flex-flow: column;
    box-sizing: border-box;
    padding: 0 1em;
}
.right {
    flex: 1;

    box-sizing: border-box;
    padding: 0 1em;
}

@media screen and (orientation: portrait) and (max-device-width: 600px) {
	.left, .right {
        flex-basis: 100vw;
        flex-grow: 0;
        flex-shrink: 0;
        padding: 0 .5em;
    }
}

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

.filter-search {
    display: flex;
    align-items: center;
    margin-bottom: .5em;
}

.filter-search > input {
    width: calc(100% - 1.6em);
    padding: .2em .5em;
    font-size: 1rem;
    font-family: var(--ja-serif);
}

.filter-test > svg.button {
    padding: 0;
    margin-left: .5em;
}
</style>
