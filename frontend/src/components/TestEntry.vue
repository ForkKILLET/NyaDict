<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

import { useTest } from '@store/test'
import { useWord } from '@store/words'

import NyaDate from '@comp/NyaDate.vue'

import { TestMode, type ITest } from '@type'

const props = defineProps<{
    test: ITest
}>()

const router = useRouter()

const wordStore = useWord()
const testStore = useTest()

const startTest = () => {
    testStore.ongoingTestId = props.test.id
    router.push('/test/go')
}

const showInWordsView = () => {
    wordStore.filter.advanced = true
    wordStore.filter.query = `inTest (tests#${props.test.id})`
    router.push('/words')
}

const currentWordText = computed(() => {
    const word = wordStore.getById(props.test.wordIds[props.test.currentIndex])
    if (! word) return
    
    const { mode } = props.test
    if (mode === TestMode.Disp) return word.disp
    else if (mode === TestMode.Sub) return word.sub
    else return ''
})
</script>

<template>
    <div
        class="card test-entry"
        :class="{ barber: test.id === testStore.lastTestId }"
    >
        <span class="test-entry-info">
            <span class="id">{{ test.id }}</span>
            <NyaDate :date="test.createTime" />
            <span>
                <span class="order">{{ test.currentIndex }}</span> /
                <span class="order">{{ test.wordIds.length }}</span>
            </span>
            <span class="current-word-text">{{ currentWordText }}</span>
        </span>
        <span class="test-entry-action">
            <fa-icon
                v-if="test.locked"
                icon="book"
                class="button"
                @click="showInWordsView"
            />
            <fa-icon
                icon="arrow-circle-right"
                class="button"
                @click="startTest"
            />
        </span>
    </div>
</template>

<style scoped>
.id {
    display: inline-block;
    text-align: left;
    width: 2em;
}

.test-entry {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
}

.test-entry-info > * {
    margin-right: .5em;
}

.current-word-text {
    color: #aaa;
}
</style>
