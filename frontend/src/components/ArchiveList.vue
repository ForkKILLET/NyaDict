<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useAuth } from '../stores/auth'
import { useWords } from '../stores/words'
import { IArchiveInfo, IWord } from '../types'
import {
        IRemoteArchiveInfo, IArchiveGetMineResp, IArchiveUploadResp, IArchiveDownloadResp
} from '../types/network'
import { downloadURL, tryJSON } from '../utils'
import { api } from '../utils/api'
import { handleResp } from '../utils/notif'
import ArchiveInfo from './ArchiveInfo.vue'
import LongPressButton from './LongPressButton.vue'

const wordsStore = useWords()
const { jwtPayload, axiosHeader } = storeToRefs(useAuth())
const { archiveId, archiveInfo } = storeToRefs(wordsStore)

type RemoteArchives = Record<string, IRemoteArchiveInfo>
const remoteArchiveInfo = ref<RemoteArchives | null>(null)

type ArchiveInfoWithRemotes = Record<string, [ IArchiveInfo?, IRemoteArchiveInfo? ]>
const archiveInfoWithRemotes = computed<ArchiveInfoWithRemotes>(() => {
    const base: ArchiveInfoWithRemotes = {}
    const localInfo = archiveInfo.value
    for (const id in localInfo) {
        base[id] = [ localInfo[id] ]
    }
    const remoteInfo = remoteArchiveInfo.value
    if (remoteInfo) for (const id in remoteInfo) {
        base[id] ??= []
        base[id][1] = remoteInfo[id]
    }
    return base
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
    if (archiveId.value === id) wordsStore.load()
}
const exportArchive = (id: string) => {
    const url = URL.createObjectURL(archiveBlobs[id])
    downloadURL(url, `nyadict-${archiveInfo.value[id].title}-${Date.now()}.json`)
    URL.revokeObjectURL(url)
}

const selectedFile = ref<File>()
const selectedTitle = computed(() => {
    if (! selectedFile.value) return
    const { name } = selectedFile.value
    return name.match(/^nyadict-(.+?)-\d+\.json$/)?.[1]
        ?? name.match(/^(.+?)\.json$/)?.[1]
        ?? name
})
const onSelectFile = (event: Event) => {
    selectedFile.value = (event.currentTarget as HTMLInputElement).files?.[0]
}
const importArchive = async () => {
    const file = selectedFile.value!
    const newJSON = await file.text()
    const newWords: IWord[] = tryJSON(newJSON)
    if (! newWords) {
        return
    }

    let newId = 0
    while (newId in archiveInfo.value) newId ++
    archiveInfo.value[newId] = {
        title: selectedTitle.value!,
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

const getRemoteArchives = async () => {
    const resp = await handleResp({
        name: 'アーカイブ・リストを取得',
        silentSuccess: true,
        action: async () => await api.get('/archive/mine', {
            headers: axiosHeader.value
        }) as IArchiveGetMineResp
    })
    if (! resp) return

    const archives: RemoteArchives = {}
    resp.forEach(info => {
        archives[info.idPerUser] = {
            ...info,
            accessTime: + new Date(info.accessTime)
        }
    })
    remoteArchiveInfo.value = archives
}
const uploadArchive = async (id: string) => {
    const info = archiveInfo.value[id]

    const resp = await handleResp({
        name: 'アップロード',
        action: async () => await api.post('/archive/upload', {
            idPerUser: id,
            title: info.title,
            content: localStorage.getItem('words:' + id),
            public: false
        }, {
            headers: axiosHeader.value
        }) as IArchiveUploadResp
    })
    if (! resp) return

    await getRemoteArchives()
}

const downloadArchive = async (id: string) => {
    const resp = await handleResp({
        name: 'ダウンロード',
        action: async () => await api.get(`/archive/mine/${id}`, {
            headers: axiosHeader.value
        }) as IArchiveDownloadResp
    })
    if (! resp) return

    archiveInfo.value[resp.idPerUser] = {
        title: resp.title,
        size: resp.size,
        wordCount: resp.wordCount,
        accessTime: + new Date(resp.accessTime)
    }

    localStorage.setItem('words:' + resp.idPerUser, resp.content)

    makeArchiveBlob(id)

    if (archiveId.value === resp.idPerUser) wordsStore.load()
}

if (jwtPayload.value) {
    getRemoteArchives()
}
</script>

<template>
    <div class="archive-list">
        <p class="archive-list-title">
            <span class="number">{{
                Object.keys(archiveInfo).length
            }}</span> アーカイブ 
            <label for="file">
                <fa-icon icon="file-arrow-up" class="button" />
            </label>
            <input id="file" type="file" accept=".json" @change="onSelectFile" />
        </p>
        <div class="archive-list-entries">
            <ArchiveInfo
                v-if="selectedFile"
                id="アップ"
                :info="{
                    title: selectedTitle!,
                    accessTime: selectedFile.lastModified,
                    size: selectedFile.size
                }"
            >
                <fa-icon
                    @click="importArchive"
                    class="button"
                    icon="file-import"
                />
            </ArchiveInfo>

            <div
                v-for="[ local, remote ], id in archiveInfoWithRemotes"
                class="archive-list-entry"
            >
                <ArchiveInfo
                    :active="id === archiveId"
                    :id="id"
                    :info="local"
                    :no-info-reason="'noLocal'"
                >
                    <fa-icon
                        @click="archiveId !== id && (archiveId = id)"
                        class="button"
                        :icon="archiveId === id ? 'flag-checkered' : 'flag'"
                        :fixed-width="true"
                    />
                    <fa-icon
                        @click="exportArchive(id)"
                        class="button"
                        icon="file-arrow-down"
                        :fixed-width="true"
                    />
                    <LongPressButton
                        @long-press="uploadArchive(id)"
                        icon="cloud-arrow-up"
                        color="#000"
                        :duration=".5"
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
                    :id="remote?.idPerUser"
                    :remote="true"
                    :info="remote"
                    :no-info-reason="jwtPayload ? 'noRemote' : 'noAccount'"
                >
                    <LongPressButton #default
                        @long-press="downloadArchive(id)"
                        icon="cloud-arrow-down"
                        color="#000"
                        :duration=".5"
                    />
                    <template #labels>
                        <div>
                            <fa-icon icon="cloud" />
                        </div>
                    </template>
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
    flex-wrap: wrap;
}

.archive-info {
    flex: 1;
    min-width: 250px;
    max-width: calc(50% - 3.2em);
    margin: 0 .8em 1.5em .8em;
}

#file {
    width: 0;
    height: 0;
    opacity: 0;
}
</style>
