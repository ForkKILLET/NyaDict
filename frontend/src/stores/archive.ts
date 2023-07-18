import { watch, shallowReactive, toValue } from 'vue'
import { defineStore } from 'pinia'
import { storeRef, storeReactive } from '@/utils/storage'
import type { IArchiveInfo, IArchiveData, IPortableArchive } from '@/types'
import { kDispose } from '@/utils/disposable'

export const useArchives = defineStore('archives', () => {
    const currentId = storeRef('archiveId', '0')
    const archiveInfo = storeReactive<Record<string, IArchiveInfo>>('archiveInfo', {})

    const archiveData = shallowReactive({}) as IArchiveData

    const archiveItemHooks: Array<{
        load: (data: IArchiveData) => (newId: string) => void
    }> = []

    const defineArchiveItem = <K extends keyof IArchiveData>(
        name: K, getItem: (key: string) => IArchiveData[K]
    ) => {
        const load = (data: IArchiveData) => (newId: string) => {
            const oldItem = archiveData[name]
            if (oldItem) oldItem[kDispose]()
            const key = `${newId}:${name}`
            data[name] = getItem(key)
        }
        archiveItemHooks.push({ load })
        watch(currentId, load(archiveData), { immediate: true })
    }

    const reloadArchive = () => {
        const newId = currentId.value
        archiveItemHooks.forEach(({ load }) => load(archiveData)(newId))
    }

    const disposeArchive = (data: IArchiveData) => {
        for (const name in data) {
            const item = data[name as keyof IArchiveData]
            if (kDispose in item) item[kDispose]()
        }
    }

    const exportArchive = (id?: string): IPortableArchive => {
        id ??= currentId.value
        const prefix = id + ':'
        const prefixLen = prefix.length
        const json: any = {}
        for (const key in localStorage) {
            if (key.startsWith(prefix)) json[key.slice(prefixLen)] = localStorage[key]
        }
        return Object.assign(json, { _info: toValue(archiveInfo[id]) })
    }

    const withdrawArchive = (id: string) => {
        for (const key in localStorage) {
            if (key.startsWith(id + ':')) localStorage.removeItem(key)
        }
    }

    const importArchive = (id: string, portable: IPortableArchive) => {
        if (portable._info?.version !== '2') return
        archiveInfo[id] = portable._info
        delete portable['_info']

        withdrawArchive(id)
        const prefix = id + ':'
        for (const key in portable) {
            localStorage.setItem(prefix + key, portable[key])
        }
    }

    Object.assign(window, { archiveData })

    return {
        currentId, archiveInfo, archiveData,
        defineArchiveItem, disposeArchive, reloadArchive, exportArchive, withdrawArchive, importArchive
    }
})
