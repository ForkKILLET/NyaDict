<script setup lang="ts">
import { ref, watch } from 'vue'
import { isHiragana } from 'wanakana'
import { addNoti } from '@/utils/notif'
import type { IWord } from '@type'

const props = defineProps<{
    word?: IWord
}>()

const disp = ref('')
const sub = ref('')
const composition = ref('')

watch(props, () => {
    if (! props.word) return
    disp.value = props.word.disp
    sub.value = props.word.sub
}, { immediate: true })

const emit = defineEmits<{
    (event: 'change', word: Omit<IWord, 'id' | 'mem'>): void
    (event: 'cancel'): void
}>()

const clearInput = () => {
    disp.value = ''
    sub.value = ''
}

const onCancel = () => {
    clearInput()
    emit('cancel')
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

    emit('change', {
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
</script>

<template>
    <div class="card">
        <span class="word-disp">
            <input
                v-model="disp"
                @compositionupdate="onCompositionUpdate"
                @compositionend="onCompositionEnd"
                @keydown.enter="onChange"
                placeholder="書き方"
            />
        </span>
        <span class="word-sub">
            <input
                v-model="sub"
                @keydown.enter="onChange"
                placeholder="読み方"
            />
        </span>
        <div class="edit-buttons">
            <fa-icon
                @click="onCancel"
                icon="times-circle" class="button"
            />
            <fa-icon
                @click="onChange"
                icon="circle-check" class="button"
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
    background-color: #ffffff;
    box-shadow: 0 0 .2em #f3aa6d4d inset;
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
