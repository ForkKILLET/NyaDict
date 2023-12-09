<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'

import { mitt } from '@util/mitt'

import WordEntry from '@comp/WordEntry.vue'
import NyaList from '@comp/NyaList.vue'

import type { IWord } from '@type'
import { GenericComponentInstanceType } from '@type/tool'

const props = defineProps<{
    words: IWord[]
    activeWordId?: number
}>()

const emit = defineEmits<{
    (event: 'goto-word', wordId: number): void
}>()

const list = ref<GenericComponentInstanceType<typeof NyaList<IWord>>>()

mitt.on('ui:word:navigate', async ({ action }) => {
    if (! list.value) return

    const { currentSlice, pagination } = list.value
    const activeIndex = currentSlice.findIndex(word => word.id === props.activeWordId)
    if (activeIndex < 0) return

    let newIndex, newId
    if (action === 'down') {
        newIndex = activeIndex + 1
        if (newIndex === currentSlice.length) {
            if (pagination.isLastPage.value) return
            pagination.next()
            await nextTick()
            newId = list.value.currentSlice[0].id
        }
        else newId = currentSlice[newIndex].id
    }
    else if (action === 'up') {
        newIndex = activeIndex - 1
        if (newIndex === - 1) {
            if (pagination.isFirstPage.value) return
            pagination.prev()
            await nextTick()
            newId = list.value.currentSlice.at(- 1)!.id
        }
        else newId = currentSlice[newIndex].id
    }

    if (newId !== undefined) {
        emit('goto-word', newId)
    }
})

watch(() => props.activeWordId, () => {
    if (props.activeWordId === undefined || ! list.value?.scrollEl) return
    const { scrollEl } = list.value
    const activeEl = scrollEl.querySelector(`.word-entry[data-word-id="${props.activeWordId}"]`)
    if (! activeEl) return
    scrollEl.scrollBy({
        top: (activeEl.getBoundingClientRect().y + activeEl.clientHeight / 2)
            - (scrollEl.getBoundingClientRect().y + scrollEl.clientHeight / 2),
        behavior: 'smooth'
    })
})
</script>

<template>
    <NyaList
        ref="list"
        :items="words"
        class="word-list"
    >
        <template #header="{ count }">
            <span class="number">{{ count }}</span> 単語
        </template>
        <template #default="{ item: word }">
            <WordEntry
                :key="word.id"
                :data-word-id="word.id"
                :word="word"
                :active="activeWordId === word.id"
                @goto-word="wordId => emit('goto-word', wordId)"
            />
        </template>
    </NyaList>
</template>
