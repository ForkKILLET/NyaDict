<script setup lang="ts">
import { ref } from 'vue'

import { useWord } from '@store/words'
import { useArchive } from '@store/archive'

import { json5Parse, json5Stringify } from '@util/storage'
import * as notif from '@util/notif'

import LongPressButton from '@comp/LongPressButton.vue'

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
            @click="json = json5Stringify(archiveStore.exportArchive())"
        >load</button>
        <button
            class="inline card deep"
            @click="archiveStore.importArchive(archiveStore.currentId, json5Parse(json))"
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
