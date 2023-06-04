<script setup lang="ts">
import { ref } from 'vue'
import { useWords } from '../../stores/words'
import { tryJSON } from '../../utils'
import Card from '../Card.vue'

const wordsStore = useWords()
const json = ref<string>(JSON.stringify(wordsStore.words, null, 2))

const saveWords = () => {
    const words = tryJSON(json.value)
    if (words) {
        wordsStore.words = words
        wordsStore.updateMaxId()
        wordsStore.save()
    }
}
</script>

<template>
    <div>
        <textarea v-model="json" spellcheck="false"></textarea>
        <br />
        <br />
        <Card class="inline button" @click="saveWords">Save words</Card>
    </div>
</template>

<style scoped>
textarea {
    border: none;
    background-color: #000;
    color: #fff;
    width: 100%;
    height: 75vh;
}
</style>
