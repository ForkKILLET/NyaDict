<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref } from 'vue'
import { useAuth } from '@store/auth'
import { downloadURL, tryJSON } from '@util'
import { api } from '@util/api'
import { handleResp } from '@util/notif'
import ArchiveInfo from '@comp/ArchiveInfo.vue'
import LongPressButton from '@comp/LongPressButton.vue'
import { useArchives } from '@/stores/archive'
import type { IArchiveInfo } from '@type'
import type {
    IRemoteArchiveInfo, IArchiveGetMineResp, IArchiveUploadResp, IArchiveDownloadResp
} from '@type/network'
import { IPortableArchive } from '@type'

const archivesStore = useArchives()
const { jwtPayload, axiosHeader } = storeToRefs(useAuth())
const { currentId, archiveInfo } = storeToRefs(archivesStore)

type RemoteArchives = Record<string, IRemoteArchiveInfo>
const remoteInfo = ref<RemoteArchives | null>(null)

type ArchiveInfoWithRemote = Record<string, [ IArchiveInfo?, IRemoteArchiveInfo? ]>
const infoWithRemote = computed<ArchiveInfoWithRemote>(() => {
    const base: ArchiveInfoWithRemote = {}
    const local = archiveInfo.value
    for (const id in local) {
        base[id] = [ local[id] ]
    }
    const remote = remoteInfo.value
    if (remote) for (const id in remote) {
        base[id] ??= []
        base[id][1] = remote[id]
    }
    return base
})

const jsons: Record<string, string> = {}
const blobs: Record<string, Blob> = {}
 
const makeBlob = (id: string) => {
    blobs[id] = new Blob([
        jsons[id] = JSON.stringify(archivesStore.exportArchive(id))
    ])
}
const withdraw = (id: string) => {
    delete archiveInfo.value[id]
    archivesStore.withdrawArchive(id)
}
const exports = (id: string) => {
    const url = URL.createObjectURL(blobs[id])
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
const imports = async () => {
    const file = selectedFile.value!
    const newJSON = await file.text()
    const newData: IPortableArchive = tryJSON(newJSON)
    if (newData?._info?.version !== '2') return

    let newId = 0
    for (const id in archiveInfo.value) newId = Math.max(+ id, newId)
    newId ++

    archivesStore.importArchive(String(newId), newData)
}

for (const id in archiveInfo.value) {
    makeBlob(id)
    archiveInfo.value[id].size = blobs[id].size
}

const getRemoteInfo = async () => {
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
    remoteInfo.value = archives
}
const upload = async (id: string) => {
    const info = archiveInfo.value[id]

    const resp = await handleResp({
        name: 'アップロード',
        action: async () => await api.post('/archive/upload', {
            ...info,
            idPerUser: id,
            content: jsons[id],
            public: false
        }, {
            headers: axiosHeader.value
        }) as IArchiveUploadResp
    })
    if (! resp) return

    await getRemoteInfo()
}

const download = async (id: string) => {
    const resp = await handleResp({
        name: 'ダウンロード',
        action: async () => await api.get(`/archive/mine/${id}`, {
            headers: axiosHeader.value
        }) as IArchiveDownloadResp
    })
    if (! resp) return

    archiveInfo.value[resp.idPerUser] = {
        version: '2',
        title: resp.title,
        size: resp.size,
        wordCount: resp.wordCount,
        accessTime: + new Date(resp.accessTime)
    }

    const newData = tryJSON(resp.content) as IPortableArchive
    if (! newData) return
    archivesStore.importArchive(id, newData)

    makeBlob(id)

    if (currentId.value === resp.idPerUser) {
        archivesStore.reloadArchive()
    }
}

if (jwtPayload.value) {
    getRemoteInfo()
}
</script>

<template>
    <div class="archive-list">
        <p class="archive-list-title">
            <span class="number">{{
                Object.keys(infoWithRemote).length
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
                    size: selectedFile.size,
                    version: 'N/A'
                }"
            >
                <fa-icon
                    @click="imports"
                    class="button"
                    icon="file-import"
                />
            </ArchiveInfo>

            <div
                v-for="[ local, remote ], id in infoWithRemote"
                class="archive-list-entry"
            >
                <ArchiveInfo
                    :active="id === currentId"
                    :id="id"
                    :info="local"
                    :no-info-reason="'noLocal'"
                >
                    <fa-icon
                        @click="currentId !== id && (currentId = id)"
                        class="button"
                        :icon="currentId === id ? 'flag-checkered' : 'flag'"
                        :fixed-width="true"
                    />
                    <fa-icon
                        @click="exports(id)"
                        class="button"
                        icon="file-arrow-down"
                        :fixed-width="true"
                    />
                    <LongPressButton
                        @long-press="upload(id)"
                        icon="cloud-arrow-up"
                        color="#000"
                        :duration=".5"
                    />
                    <LongPressButton
                        @long-press="withdraw(id)"
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
                        @long-press="download(id)"
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
    min-width: 12.5em;
    max-width: calc(50% - 3.2em);
    margin: 0 .8em 1.5em .8em;
}

#file {
    width: 0;
    height: 0;
    opacity: 0;
}
</style>
