<script setup lang="ts">
import { ref } from 'vue'
import { useArchive } from '@/stores/archive'

const archiveStore = useArchive()
const json = ref('')
</script>

<template>
    <div>
        <textarea :value="json" spellcheck="false"></textarea>
        <br />
        <br />
        <button
            class="inline card"
            @click="json = JSON.stringify(archiveStore.exportArchive())"
        >load</button>
        <button
            class="inline card"
            @click="archiveStore.importArchive(archiveStore.currentId, JSON.parse(json))"
        >save</button>
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
