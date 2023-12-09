<script setup lang="ts">
import { ref } from 'vue'

import { emptyMem, useWord } from '@store/words'
import { ARCHIVE_VERSION, useArchive } from '@store/archive'

import { json5Parse, json5Stringify, json5TryParse } from '@util/storage'
import * as notif from '@util/notif'

import { parse, stringify } from '@util/nyatalk'

Object.assign(window, { parse, stringify })

import LongPressButton from '@comp/LongPressButton.vue'

const archiveStore = useArchive()
const wordStore = useWord()

const json = ref('')
const wordsText = ref('')

const genGraph = () => {
    wordStore.updateGraphs()
    notif.addNoti({ content: 'graph gened', type: 'success' })
}

const optimizeArchive = () => {
    const json = archiveStore.exportArchive()

    for (const key in json) {
        if (key === '_info') continue
        const value = json5Stringify(json5TryParse(json[key]))

        if (key.includes('#')) {
            json[key.replace('#', '$')] = value
            delete json[key]
            continue
        }

        json[key] = value
    }

    if (json._info?.version === '3') {
        json._info.version = ARCHIVE_VERSION
    }

    archiveStore.importArchive(archiveStore.currentId, json)

    notif.addNoti({
        type: 'success',
        content: 'アーカイブを直しました。',
        duration: 2 * 1000
    })
}

const addManyWords = () => {
    const words = wordsText.value
        .trim()
        .split('\n')
        .filter(ln => ln)
        .map(ln => {
            const [ disp, sub ] = ln.split(/\s+|\s*,\s*/)
            return { disp, sub, mem: emptyMem() }
        })

    words.forEach(word => {
        wordStore.add(word)
    })

    notif.addNoti({
        type: 'success',
        content: `単語を${words.length}個作成しました。`,
        duration: 2 * 1000
    })
}
</script>

<template>
    <div class="content">
        <div>
            <textarea
                v-model="json"
                spellcheck="false"
            />

            <button
                class="inline card deep"
                @click="json = json5Stringify(archiveStore.exportArchive(), '&quot;')"
            >
                load
            </button>
            <button
                class="inline card deep"
                @click="archiveStore.importArchive(archiveStore.currentId, json5Parse(json))"
            >
                save
            </button>
            <button
                class="inline card deep"
                @click="optimizeArchive"
            >
                optimize / fix
            </button>
        </div>

        <div>
            <textarea v-model="wordsText" />
            <button
                class="inline card deep"
                @click="addManyWords"
            >
                add many words
            </button>
        </div>

        <div>
            <button
                class="inline card deep"
                @click="notif.addNoti({ content: '' + Math.random(), type: 'info' })"
            >
                noti
            </button>
            <LongPressButton
                icon="eye"
                color="var(--color-fg)"
                desc="test"
                :delay="2"
                @long-press="notif.addNoti({ content: 'OK', type: 'success' })"
            />
        </div>

        <div>
            <button
                class="inline card deep"
                @click="genGraph"
            >
                gen graph
            </button>
        </div>
    </div>
</template>

<style scoped>
textarea {
    border: 1px solid var(--color-fg);
    background-color: var(--color-bg);
    color: var(--color-fg);
    width: 100%;
    height: 50vh;
    margin-bottom: 1em;
}

div + div {
    margin-top: 1em;
}

.content {
    padding: 1em;
}
</style>
