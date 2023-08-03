<script setup lang="ts">
import { computed, ref } from 'vue'
import { useWord } from '@store/words'
import NyaDate from '@comp/NyaDate.vue'
import LongPressButton from '@comp/LongPressButton.vue'
import WordMemCalendar from '@comp/WordMemCalendar.vue'
import NyaTab from '@comp/NyaTab.vue'
import WordDocument from '@comp/WordDocument.vue'
import WordDocumentAdder from '@comp/WordDocumentAdder.vue'
import type { IWord, IWordDocumentWithoutId } from '@type'
import NyaConfirmInput from './NyaConfirmInput.vue'

const wordStore = useWord()

const props = defineProps<{
    word: IWord
}>()

const withdrawed = computed(() => ! wordStore.getById(props.word.id))

const newlyAddedDocId = ref<number | null>(null)

const addDoc = (newDoc: IWordDocumentWithoutId) => {
    const doc = props.word.doc ??= {
        maxId: 0,
        docs: []
    }
    const id = doc.maxId ++
    doc.docs.push({
        ...newDoc,
        id
    })
    newlyAddedDocId.value = id
}
</script>

<template>
    <div class="word-detail">
        <span class="id">{{ word.id }}</span>

        <NyaConfirmInput v-model="word.disp" class="word-disp" />
        <NyaConfirmInput v-model="word.sub" class="word-sub" />

        <p>
            <LongPressButton
                v-if="! withdrawed"
                @long-press="wordStore.withdraw(word.id)"
                icon="trash"
                color="#ec4e1e"
                :duration="1.5"
            />
            <LongPressButton
                v-else
                @long-press="word.id = wordStore.add(word)"
                icon="trash-restore"
                color="#db8e30"
                :duration=".5"
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
                <WordDocumentAdder :word="word" @add-doc="addDoc" />
                <WordDocument
                    v-for="doc of word.doc?.docs ?? []"
                    :doc="doc"
                    :edit-mode="newlyAddedDocId === doc.id"
                />
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
    margin-bottom: 5em;
}
</style>
