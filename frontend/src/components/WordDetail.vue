<script setup lang="ts">
import { computed, ref } from 'vue'

import { useWord } from '@store/words'

import NyaDate from '@comp/NyaDate.vue'
import LongPressButton from '@comp/LongPressButton.vue'
import WordMemCalendar from '@comp/WordMemCalendar.vue'
import NyaTab from '@comp/NyaTab.vue'
import NyaConfirmInput from '@comp/NyaConfirmInput.vue'
import WordDocumentList from '@comp/WordDocumentList.vue'
import WordDocumentAdder from '@comp/WordDocumentAdder.vue'
import WordGraphList from '@comp/WordGraphList.vue'

import type { IWord, IWordDocumentWithoutId } from '@type'
import WordGraphChart from './WordGraphChart.vue'

const props = withDefaults(defineProps<{
    word: IWord
    zenMode?: boolean
    container?: HTMLElement | null
}>(), {
    zenMode: true
})

const wordStore = useWord()

const withdrawed = computed(() => ! wordStore.getById(props.word.id))

const addDoc = (doc: IWordDocumentWithoutId) => {
    const id = wordStore.addDoc(props.word.docs ??= [], doc)
    wordStore.newlyAddedDocId = id
}

const wordDetailEl = ref<HTMLDivElement>()
const scrollEl = computed(() => props.container ?? wordDetailEl.value)
const editingEl = ref<HTMLInputElement>()
const onFocus = ({ target: el }: FocusEvent) => {
    if (! props.zenMode) return
    if (! scrollEl.value) return
    if (! (el && el instanceof HTMLInputElement)) return
    if (el.parentElement?.classList.contains('word-mini-searcher')) return

    editingEl.value = el
    setCenter(el)
}
const setCenter = (el: HTMLElement) => {
    const delta = el.getBoundingClientRect().y - window.innerHeight / 2
    scrollEl.value?.scrollBy({ top: delta, behavior: 'smooth' })
}

window.addEventListener('resize', () => {
    const el = editingEl.value
    if (el) setCenter(el)
})
</script>

<template>
    <div class="word-detail" ref="wordDetailEl">
        <RouterLink :to="`/words?id=${word.id}`">
            <span class="id">{{ word.id }}</span>
        </RouterLink>

        <NyaConfirmInput v-model="word.disp" class="word-disp" />
        <NyaConfirmInput v-model="word.sub" class="word-sub" />

        <p>
            <LongPressButton
                v-if="! withdrawed"
                @long-press="wordStore.withdraw(word.id)"
                icon="trash"
                color="var(--color-wrong)"
                desc="削除"
                :delay="1.5"
            />
            <LongPressButton
                v-else
                @long-press="wordStore.restore(word)"
                icon="trash-restore"
                color="var(--color-ui)"
                desc="削除取り消し"
                :delay=".5"
            />
        </p>

        <NyaTab :tabs="[
            { name: 'dict', title: '辞書' },
            { name: 'mem', title: 'メモリー' },
            { name: 'link', title: 'リンク' }
        ]">
            <template #mem>
                <div>
                    <fa-icon icon="plus" :fixed-width="true" />
                    <NyaDate :date="word.mem.createTime" />
                </div>
                <div>
                    <fa-icon icon="forward" :fixed-width="true" /> 
                    <NyaDate v-if="word.mem.testAfter" :date="word.mem.testAfter" />
                    <span v-else class="number">今</span>
                </div>
                <WordMemCalendar :mem="word.mem" />
            </template>
            <template #dict>
                <div class="toolbar">
                    <WordDocumentAdder @add-doc="addDoc" />
                </div>

                <WordDocumentList
                    @focus.capture="onFocus"
                    @blur.capture="editingEl = undefined"
                    :word="word"
                    :node="word"
                />
            </template>
            <template #link>
                <WordGraphList
                    v-if="word.graph"
                    :graph="word.graph"
                />
                <WordGraphChart :word="word" />
            </template>
        </NyaTab>
    </div>
</template>

<style scoped>
.word-disp, .word-sub {
    margin: 0;
}

.word-disp :deep(input), .word-sub :deep(input) {
    width: calc(100% - 4rem);
}

.word-disp {
    font-size: 2em;
    font-weight: bold;
    margin-bottom: .5rem;
}

.calendar {
    min-width: 80%;
    margin-top: 1em;
}

.nya-tab[data-tab=mem] > div > svg {
    margin-right: .2em;
}

.nya-tab[data-tab=dict] {
    margin-bottom: 10em;
}

.nya-tab[data-tab=dict] > .toolbar {
    margin-bottom: .5em;
}

.nya-tab[data-tab=link] > div > svg {
    margin-right: .5em;
}

.word-graph-chart {
    max-width: 100vw;
    height: 50vh;
}
</style>
