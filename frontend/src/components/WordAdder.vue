<script setup lang="ts">
import { ref, watch } from 'vue'
import { isHiragana } from 'wanakana'

import { emptyMem, useWord } from '@store/words'

import { addNoti } from '@util/notif'
import { mitt, useFocusSignal } from '@util/mitt'

import type { IWord } from '@type'

const props = defineProps<{
    word?: IWord
}>()

const wordStore = useWord()

const disp = ref('')
const sub = ref('')
const composition = ref('')

const dispEl = ref<HTMLInputElement>()

watch(props, () => {
    if (! props.word) return
    disp.value = props.word.disp
    sub.value = props.word.sub
}, { immediate: true })

defineEmits<{
    (event: 'change'): void
    (event: 'cancel'): void
}>()

const clearInput = () => {
    disp.value = ''
    sub.value = ''
}

const onCancel = () => {
    clearInput()
}

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
                    onClick: () => res(true)
                },
                {
                    info: 'いいえ',
                    onClick: () => res(false)
                },
                {
                    info: '重複しそうな単語をチェック',
                    onClick: () => {
                        mitt.emit('data:word:goto', { wordId: similarWord.id })
                        return false
                    }
                }
            ],
            closable: false,
            onClose: () => res(false)
        }))
        if (! doAdd) return
    }
    const id = wordStore.add({ ...word, mem: emptyMem() })
    mitt.emit('data:word:goto', { wordId: id })
}

const onChange = () => {
    if (! disp.value || ! sub.value) {
        const missing = []
        if (! disp.value) missing.push('書き方')
        if (! sub.value) missing.push('読み方')
        addNoti({
            type: 'error',
            content: `単語の${missing.join('と')}を入力ください`,
            duration: 2 * 1000
        })
        return
    }

    addWord({
        disp: disp.value,
        sub: sub.value
    })

    clearInput()
}

const onCompositionUpdate = (event: CompositionEvent) => {
    if (isHiragana(event.data)) composition.value = event.data
}

const onCompositionEnd = (event: CompositionEvent) => {
    if (
        disp.value &&                   // Exclude situation like 'あ' -> ''
        event.data === disp.value &&    // Not to bother user when editing
        composition.value               // Valid hiragana composition exist
    ) sub.value = composition.value
    composition.value = ''
}

useFocusSignal(dispEl, 'ui:word:add')
</script>

<template>
    <div class="card">
        <span class="word-disp">
            <input
                ref="dispEl"
                v-model="disp"
                placeholder="書き方"
                autofocus="true"
                @compositionupdate="onCompositionUpdate"
                @compositionend="onCompositionEnd"
                @keydown.enter="onChange"
            >
        </span>
        <span class="word-sub">
            <input
                v-model="sub"
                placeholder="読み方"
                @keydown.enter="onChange"
            >
        </span>
        <div class="edit-buttons">
            <fa-icon
                icon="times-circle"
                class="button"
                @click="onCancel"
            />
            <fa-icon
                icon="circle-check"
                class="button"
                @click="onChange"
            />
        </div>
    </div>
</template>

<style scoped>
.card {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.word-disp, .word-sub {
    display: inline-block;
    border-radius: .4em;
    background-color: var(--color-bg);
    box-shadow: 0 0 .2em var(--color-shad-ui-alt) inset;
}

input {
    width: 100%;
    color: inherit;
    background-color: transparent;
    font-family: inherit;
}

.edit-buttons {
    white-space: nowrap;
}
</style>
