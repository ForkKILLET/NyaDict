<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWord } from '@store/words'
import NyaDate from '@comp/NyaDate.vue'
import LongPressButton from '@comp/LongPressButton.vue'
import WordMemCalendar from '@comp/WordMemCalendar.vue'
import NyaTab from '@comp/NyaTab.vue'
import type { IWord } from '@type'
import NyaConfirmInput from './NyaConfirmInput.vue'
import WordDocumentList from './WordDocumentList.vue'
import WordDocumentAdder from './WordDocumentAdder.vue'

const wordStore = useWord()

const props = withDefaults(defineProps<{
    word: IWord
    zenMode?: boolean
}>(), {
    zenMode: true
})

const withdrawed = computed(() => ! wordStore.getById(props.word.id))

const wordDetailEl = ref<HTMLDivElement>()
const editingEl = ref<HTMLInputElement>()
const onFocus = ({ target: el }: FocusEvent) => {
    if (! props.zenMode) return
    if (! wordDetailEl.value) return
    if (! (el && el instanceof HTMLInputElement)) return
    if (el.parentElement?.classList.contains('word-mini-searcher')) return

    editingEl.value = el
    setCenter(el)
}
const setCenter = (el: HTMLElement) => {
    const delta = el.getBoundingClientRect().y - window.innerHeight / 2
    wordDetailEl.value?.scrollBy({ top: delta, behavior: 'smooth' })
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
                color="#ec4e1e"
                :delay="1.5"
            />
            <LongPressButton
                v-else
                @long-press="word.id = wordStore.add(word)"
                icon="trash-restore"
                color="#db8e30"
                :delay=".5"
            />
        </p>

        <NyaTab :tabs="[
            { name: 'dict', title: '辞書' },
            { name: 'mem', title: 'メモリー' },
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
                <WordDocumentList
                    @focus.capture="onFocus"
                    @blur.capture="editingEl = undefined"
                    :word="word"
                    :node="word"
                />

                <WordDocumentAdder @add-doc="doc => wordStore.addDoc(word.docs ??= [], doc)" />
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

.nya-tab[data-tab=dict] > svg.button {
    padding-left: 0;
    margin-bottom: .5em;
}
</style>
