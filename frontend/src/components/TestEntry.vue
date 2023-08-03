<script setup lang="ts">
import { useTest } from '@/stores/test'
import { useRouter } from 'vue-router';
import NyaDate from '@comp/NyaDate.vue'
import type { ITest } from '@type'
import { useWord } from '@/stores/words';
import { computed } from 'vue';

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
    wordStore.filter.testId = props.test.id
    router.push('/words')
}

const currentWordText = computed(() => wordStore
    .getById(props.test.wordIds[props.test.currentIndex])
    ?.[props.test.mode === 'disp' ? 'sub' : 'disp']
)
</script>

<template>
    <div class="card test-entry" :class="{ barber: test.id === testStore.lastTestId }">
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
                @click="showInWordsView"
                icon="book" class="button"
            />
            <fa-icon
                @click="startTest"
                icon="arrow-circle-right" class="button"
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
