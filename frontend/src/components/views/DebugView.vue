<script setup lang="ts">
import { ref } from 'vue'
import { useArchive } from '@store/archive'
import LongPressButton from '@comp/LongPressButton.vue'
import * as notif from '@util/notif'

const archiveStore = useArchive()
const json = ref('')
</script>

<template>
    <div>
        <textarea v-model="json" spellcheck="false"></textarea>
        <br /> <br />

        <button
            @click="json = JSON.stringify(archiveStore.exportArchive())"
        >load</button> &nbsp;
        <button
            @click="archiveStore.importArchive(archiveStore.currentId, JSON.parse(json))"
        >save</button> &nbsp;

        <br /><br />

        <button @click="notif.addNoti({ content: '' + Math.random(), type: 'info' })">noti</button> &nbsp;
        <LongPressButton
            icon="eye"
            color="#000"
            desc="test"
            :delay="2"
        />
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
