<script setup lang="ts">
import { ref } from 'vue'
import { useWords } from '@store/words'
// import { tryJSON } from '@util'

const wordsStore = useWords()
const json = ref<string>(JSON.stringify(wordsStore.words, null, 2))

const saveWords = () => {
    // const words = tryJSON(json.value)
    // if (words) {
    //     wordsStore.words = words
    //     wordsStore.updateMaxId()
    // }
}
</script>

<template>
    <div>
        <textarea v-model="json" spellcheck="false"></textarea>
        <br />
        <br />
        <button class="inline card" @click="saveWords">保存</button>
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
