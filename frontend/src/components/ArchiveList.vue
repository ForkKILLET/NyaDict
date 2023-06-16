<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useAuth } from '../stores/auth'
import { useWords } from '../stores/words'
import { IWord } from '../types'
import { IRemoteArchive, IArchiveGetMineResp } from '../types/network'
import { downloadURL, tryJSON } from '../utils'
import { api } from '../utils/api'
import ArchiveInfo from './ArchiveInfo.vue'
import LongPressButton from './LongPressButton.vue'

const { jwtPayload, axiosHeader } = storeToRefs(useAuth())
const { archiveId, archiveInfo } = storeToRefs(useWords())

type RemoteArchives = Record<string, IRemoteArchive>
const remoteArchives = ref<RemoteArchives | null>(null)
const undownloadedRemoteArchives = computed(() => {
    const clone = { ...remoteArchives.value }
    for (const { remoteId } of Object.values(archiveInfo.value)) {
        delete clone[remoteId!]
    }
    return clone
})
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

onMounted(async () => {
    if (jwtPayload.value) {
        const resp = await api.get('/archive/mine', {
            headers: axiosHeader.value
        }) as IArchiveGetMineResp

        if (! resp) return
        if (resp.statusCode !== 200) return

        const archives: RemoteArchives = {}
        console.log(resp)
        resp.forEach(info => {
            archives[info._id] = info
        })
        remoteArchives.value = archives
    }
})
</script>

<template>
    <div class="archive-list">
        <p class="archive-list-title">
            <span class="number">{{
                Object.keys(archiveInfo).length + Object.keys(undownloadedRemoteArchives).length
            }}</span> アーカイブ 
            <label for="file">
                <fa-icon icon="file-arrow-up" class="button" />
            </label>
            <input id="file" type="file" accept=".json" @change="onUploadFile" />
        </p>
        <div class="archive-list-entries">
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
            <div class="archive-list-entry" v-for="info, id in archiveInfo">
                <ArchiveInfo
                    :active="id === archiveId"
                    :id="id"
                    :info="info"
                >
                    <fa-icon
                        @click="archiveId !== id && (archiveId = id)"
                        class="button"
                        :icon="archiveId === id ? 'flag-checkered' : 'flag'"
                        :fixed-width="true"
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
                    :active="false"
                    :info="(remoteArchives && info.remoteId) ? remoteArchives[info.remoteId] : undefined"
                    :no-info-reason="jwtPayload ? 'noRemote' : 'noAccount'"
                >

                </ArchiveInfo>
            </div>
            <div class="archive-list-entry" v-for="info in undownloadedRemoteArchives">
                <ArchiveInfo
                    no-info-reason="noLocal"
                >

                </ArchiveInfo>
                <ArchiveInfo
                    :active="false"
                    :info="info"
                >

                </ArchiveInfo>
            </div>
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

.archive-list-entry {
    display: flex;
}

.archive-info {
    flex: 1;
    max-width: calc(50% - 3.2em);
    margin: 0 .8em 1.5em .8em;
}

#file {
    width: 0;
    height: 0;
    opacity: 0;
}
</style>
