<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useWords } from '../stores/words'
import { IWord } from '../types'
import { downloadURL, tryJSON } from '../utils'
import ArchiveInfo from './ArchiveInfo.vue'
import LongPressButton from './LongPressButton.vue'

const { archiveId, archiveInfo } = storeToRefs(useWords())
const archiveBlobs: Record<string, Blob> = {}
const makeArchiveBlob = (id: string) => {
    archiveBlobs[id] = new Blob([
        localStorage.getItem('words:' + id)!
    ])
}
const withdrawArchive = (id: string) => {
    delete archiveInfo.value[id]
    localStorage.removeItem('words:' + id)
}
const downloadArchive = (id: string) => {
    const url = URL.createObjectURL(archiveBlobs[id])
    downloadURL(url, `nyadict-${archiveInfo.value[id].title}-${Date.now()}.json`)
    URL.revokeObjectURL(url)
}

const uploadedFile = ref<File>()
const uploadedTitle = computed(() => {
    if (! uploadedFile.value) return
    const { name } = uploadedFile.value
    return name.match(/^nyadict-(.+?)-\d+\.json$/)?.[1]
        ?? name.match(/^(.+?)\.json$/)?.[1]
        ?? name
})
const onUploadFile = (event: Event) => {
    uploadedFile.value = (event.currentTarget as HTMLInputElement).files?.[0]
}
const importArchive = async () => {
    const file = uploadedFile.value!
    const newJSON = await file.text()
    const newWords: IWord[] = tryJSON(newJSON)
    if (! newWords) {
        return
    }

    let newId = 0
    while (newId in archiveInfo.value) newId ++
    archiveInfo.value[newId] = {
        title: uploadedTitle.value!,
        accessTime: Date.now(),
        wordCount: newWords.length,
        size: file.size
    }

    localStorage.setItem('words:' + newId, newJSON)
}

for (const id in archiveInfo.value) {
    makeArchiveBlob(id)
    archiveInfo.value[id].size = archiveBlobs[id].size
}
</script>

<template>
    <div class="archive-list">
        <p class="archive-list-title">
            <span class="number">{{ Object.keys(archiveInfo).length }}</span> アーカイブ 
            <label for="file">
                <fa-icon icon="file-arrow-up" class="button" />
            </label>
            <input id="file" type="file" accept=".json" @change="onUploadFile" />
        </p>
        <div class="archive-list-entries">
            <ArchiveInfo
                v-for="info, id in archiveInfo"
                :active="id === archiveId"
                :id="id"
                :info="info"
            >
                <fa-icon
                    @click="archiveId !== id && (archiveId = id)"
                    class="button"
                    icon="flag"
                    :fixed-width="true"
                    :class="{
                        active: archiveId === id
                    }"
                />
                <fa-icon
                    @click="downloadArchive(id)"
                    class="button"
                    icon="file-arrow-down"
                    :fixed-width="true"
                />
                <LongPressButton
                    @long-press="withdrawArchive(id)"
                    icon="trash"
                    color="#ec4e1e"
                    :duration="1.5"
                />
            </ArchiveInfo>

            <ArchiveInfo
                v-if="uploadedFile"
                id="アップ"
                :info="{
                    title: uploadedTitle!,
                    accessTime: uploadedFile.lastModified,
                    size: uploadedFile.size
                }"
            >
                <fa-icon
                    @click="importArchive"
                    class="button"
                    icon="file-import"
                />
            </ArchiveInfo>
        </div>
    </div>
</template>

<style scoped>
.archive-list {
    display: flex;
    flex-flow: column;
}

.archive-list-entries {
    flex: 1;
    overflow-y: auto;
    margin: -1em -.5em;
    padding: 1em;
    scrollbar-width: none;
}
.archive-list-entries::-webkit-scrollbar {
    display: none;
}

.archive-info {
    width: 40%;
    min-width: 16rem;
    margin-bottom: 1.5em;
}

#file {
    width: 0;
    height: 0;
    opacity: 0;
}

svg.active, svg.active:hover {
    color: #8358f9;
    cursor: auto;
}
</style>
