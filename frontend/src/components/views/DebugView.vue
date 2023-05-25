<script setup lang="ts">
import { ref } from 'vue'
import { useWords } from '../../stores/words';
import { tryJSON } from '../../utils'

const json = ref<string>()

const wordsStore = useWords()

const importWords = () => {
    const words = tryJSON(json.value)
    wordsStore.merge(words)
}
</script>

<template>
    <div>
        <textarea v-model="json"></textarea> <br />
        <button @click="importWords">Import words</button>
    </div>

    <div>
        <textarea :value="JSON.stringify(wordsStore.words, null, 2)"></textarea> <br />
        <button @click="wordsStore.save">Save words</button>
    </div>
</template>