<script setup lang="ts">
import {
    computed, ref, toRefs, watch, onMounted,
    type Ref, type Component
} from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useWord } from '@store/words'

import { isPortrait } from '@util/media'
import { newKey, registerShortcuts } from '@util/keyboard'
import { mitt } from '@util/mitt'

import WordAdder from '@comp/WordAdder.vue'
import WordList from '@comp/WordList.vue'
import WordDetail from '@comp/WordDetail.vue'
import WordNavigator from '@comp/WordNavigator.vue'
import WordFilter from '@comp/WordFilter.vue'
import WordSorter from '@comp/WordSorter.vue'
import WordHistory from '@comp/WordHistory.vue'

import type { IWord } from '@type'

// Toolbar

type ToolbarMode = 'add' | 'sort' | 'filter' | 'history'
const toolbarMode = ref<ToolbarMode | null>(null)
const changeToolbarMode = (mode: ToolbarMode) => {
    toolbarMode.value = toolbarMode.value === mode ? null : mode
    const item = toolbarConfig[mode]
    item.action?.(item)
}
type ToolbarConfigItem = {
    icon: string | Ref<string>
    component?: Component
    action?: (item: ToolbarConfigItem) => void
}
const toolbarConfig: Record<ToolbarMode, ToolbarConfigItem> = {
    add: {
        icon: 'circle-plus',
        component: WordAdder
    },
    sort: {
        icon: 'sort',
        component: WordSorter
    },
    filter: {
        icon: 'filter',
        component: WordFilter
    },
    history: {
        icon: 'clock-rotate-left',
        component: WordHistory
    }
}

const wordStore = useWord()
const currentWord = ref<IWord>()

// Filtering

const { filterFn, filter } = toRefs(wordStore)

const filteredWords = computed(() => {
    if (filterFn.value) {
        return wordStore.words.filter(filterFn.value)
    }
    return [ ...wordStore.words ]
})

onMounted(() => {
    if (filter.value.query) {
        toolbarMode.value = 'filter'
    }
})

// Sorting

const { sorterFn } = toRefs(wordStore)

const sortedWords = computed(() => {
    if (! filteredWords.value) return
    if (sorterFn.value)
        return [ ...filteredWords.value ].sort(sorterFn.value)
    return filteredWords.value
})

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

mitt.on('data:word:goto', ({ wordId }) => {
    gotoWord(wordId)
})

watch(route, () => {
    const { id } = route.query
    if (typeof id === 'string' && id) {
        const queryingWord = wordStore.getById(+ id)
        if (queryingWord) currentWord.value = queryingWord
    }
}, { immediate: true })

// Shortcuts

registerShortcuts([
    {
        id: 'words:filter:clear',
        key: newKey('Backspace'),
        info: 'フィルターをクリア',
        isActive: () => route.path === '/words',
        action: () => {
            filter.value.query = ''
        }
    },
    {
        id: 'words:toolbar:add',
        key: newKey('Alt + a'),
        info: '単語作成へ',
        action: () => {
            toolbarMode.value = 'add'
            setTimeout(() => mitt.emit('ui:word:add', {}))
        }
    },
    {
        id: 'words:toolbar:sort',
        key: newKey('Alt + s'),
        info: '単語ソートへ',
        action: () => {
            toolbarMode.value = 'sort'
        }
    },
    {
        id: 'words:toolbar:filter',
        key: newKey('Alt + f'),
        info: '単語フィルターへ',
        action: () => {
            toolbarMode.value = 'filter'
            setTimeout(() => mitt.emit('ui:word:filter', {}))
        }
    },
    {
        id: 'words:toolbar:close',
        key: newKey('Alt + q'),
        info: '単語ツールバーを閉じる',
        action: () => {
            toolbarMode.value = null
        }
    }
])
</script>

<template>
    <div
        ref="contentEl"
        class="content scroll-x"
    >
        <div class="left">
            <div class="glowing toolbar">
                <div class="toolbar-nav">
                    <fa-icon
                        v-for="conf, mode of toolbarConfig"
                        :key="mode"
                        class="button"
                        :icon="conf.icon"
                        @click="changeToolbarMode(mode)"
                    />
                </div>
                <div
                    v-show="toolbarMode"
                    class="toolbar-main"
                >
                    <template
                        v-for="conf, mode of toolbarConfig"
                    >
                        <component
                            :is="conf.component"
                            v-if="conf.component"
                            v-show="mode === toolbarMode"
                            :key="mode"
                        />
                    </template>
                </div>
            </div>
            <WordList
                v-if="sortedWords"
                class="scroll-y"
                :active-word-id="currentWord?.id"
                :words="sortedWords"
                @goto-word="gotoWord"
            />
        </div>
        <WordDetail
            v-if="currentWord"
            class="right scroll-y"
            :word="currentWord"
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
</style>
