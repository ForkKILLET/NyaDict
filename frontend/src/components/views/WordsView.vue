<script setup lang="ts">
import { computed, reactive, ref, toRefs, watch, type Ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
    useWord, emptyMem,
    getCorrectness, getYomikataIndex, getLastTestTime
} from '@store/words'

import { isPortrait } from '@util/media'
import { compile, parse, IQueryFilter, QueryError } from '@util/filterQuery'
import { addNoti } from '@util/notif'

import WordEditor from '@comp/WordEditor.vue'
import WordList from '@comp/WordList.vue'
import WordDetail from '@comp/WordDetail.vue'
import WordNavigator from '@comp/WordNavigator.vue'
import WordFilter from '@comp/WordFilter.vue'

import type { IWord, IWordSortMethod } from '@type'

// Toolbar

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

const wordStore = useWord()
const currentWord = ref<IWord>()

// Filtering

const { query } = toRefs(wordStore.filter)
const compiledFilter = ref<IQueryFilter | null>(null)
const queryParseError = ref<QueryError | null>(null)
watch(query, () => {
    const result = parse(query.value)
    if (result.state === 'null') {
        compiledFilter.value = null
        queryParseError.value = null
    }
    else if (result.state === 'error') {
        compiledFilter.value = null
        queryParseError.value = result.error
    }
    else {
        compiledFilter.value = compile(result.structured)
        queryParseError.value = null
    }
}, { immediate: true })
const filteredWords = computed(() => {
    if (compiledFilter.value) return wordStore.words.filter(compiledFilter.value)
    return [...wordStore.words]
})

onMounted(() => {
    if (compiledFilter.value) {
        toolbarMode.value = 'filter'
    }
})

// Sorting

const { method: sortMethod, direction: sortDirection } = toRefs(wordStore.sorter)
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
const sortedWords = computed(() => {
    if (! filteredWords.value) return
    return [...filteredWords.value].sort(sortFunction.value)
})
const onSortMethodClick = (method: IWordSortMethod) => {
    if (method === sortMethod.value) {
        sortDirection.value = sortDirection.value === 'up' ? 'down' : 'up'
    }
    else {
        sortMethod.value = method
    }
}

// Adding

const addWord = async (word: Omit<IWord, 'id' | 'mem'>) => {
    const similarWord = wordStore.words.find(word2 => (
        word2.disp === word.disp && word2.sub === word.sub
    ))
    if (similarWord) {
        const doAdd = await new Promise(res => addNoti({
            type: 'info',
            content: `「${word.disp}」という単語は重複しそうです。まだ作成しますか。`,
            actions: [
                {
                    info: 'はい',
                    onclick: () => res(true)
                },
                {
                    info: 'いいえ',
                    onclick: () => res(false)
                },
                {
                    info: '重複しそうな単語をチェック',
                    onclick: () => {
                        gotoWord(similarWord.id)
                        return false
                    }
                }
            ],
            closable: false,
            onclose: () => res(false)
        }))
        if (! doAdd) return
    }
    const id = wordStore.add({ ...word, mem: emptyMem() })
    gotoWord(id)
}

// Route

const router = useRouter()
const route = useRoute()
const contentEl = ref<HTMLDivElement>()

const gotoWord = async (wordId: number) => {
    await router.replace(`/words?id=${wordId}`)
    if (isPortrait.value) contentEl.value?.scrollBy({
        left: window.innerWidth,
        behavior: 'smooth'
    })
}

watch(route, () => {
    const { id } = route.query
    if (typeof id === 'string' && id) {
        const queryingWord = wordStore.getById(+ id)
        if (queryingWord) currentWord.value = queryingWord
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
                        :icon="conf.icon"
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
                        <WordFilter v-model="query" ref="wordFilter" />
                        <pre class="query-parse-error scroll-x" v-if="queryParseError">{{
                            queryParseError.message
                        }}</pre>
                    </div>
                </div>
            </div>
            <WordList
                v-if="sortedWords"
                @goto-word="gotoWord"
                :active-word-id="currentWord?.id"
                :words="sortedWords"
                class="scroll-y"
            />
        </div>
        <WordDetail
            v-if="currentWord"
            :word="currentWord"
            class="right scroll-y"
        />
        <WordNavigator />
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
    .word-list {
        width: 100%;
        padding-right: .5em;
    }

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

.query-parse-error {
    color: var(--color-wrong);
    font-family: var(--font-mono);
    font-size: .8em;
}
</style>
