<script setup lang="ts">
import { ref } from 'vue'
import { useWord } from '@store/words'
import { useArchive } from '@store/archive'
import LongPressButton from '@comp/LongPressButton.vue'
import * as notif from '@util/notif'

const archiveStore = useArchive()
const wordStore = useWord()
const json = ref('')

const genGraph = () => {
    wordStore.updateGraphs()
    notif.addNoti({ content: 'graph gened', type: 'success' })
}
</script>

<template>
    <div>
        <textarea v-model="json" spellcheck="false"></textarea>

        <button
            class="inline card deep"
            @click="json = JSON.stringify(archiveStore.exportArchive())"
        >load</button>
        <button
            class="inline card deep"
            @click="archiveStore.importArchive(archiveStore.currentId, JSON.parse(json))"
        >save</button>
    </div>

    <div>
        <button
            class="inline card deep"
            @click="notif.addNoti({ content: '' + Math.random(), type: 'info' })"
        >noti</button>
        <LongPressButton
            icon="eye"
            color="#000"
            desc="test"
            :delay="2"
        />
    </div>

    <div>
        <button
            class="inline card deep"
            @click="genGraph"
        >gen graph</button>
    </div>
</template>

<style scoped>
textarea {
    border: none;
    background-color: #000;
    color: #fff;
    width: 100%;
    height: 50vh;
    margin-bottom: 1em;
}

div + div {
    margin-top: 1em;
}
</style>
