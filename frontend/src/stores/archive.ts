import {
    watch, toValue, shallowReactive, computed,
    type WritableComputedRef, type UnwrapRef
} from 'vue'
import { defineStore, storeToRefs } from 'pinia'

import { storeRef, storeReactive, setStorageRaw, delStorage } from '@util/storage'
import { kDispose } from '@util/disposable'

import { useConfig } from '@store/config'

import type { IArchiveInfo, IArchiveData, IPortableArchive, IArchiveVersion } from '@type'
import { mitt } from '@util/mitt'

export const ARCHIVE_VERSION: IArchiveVersion = '3.1'

export const useArchive = defineStore('archives', () => {
    const { config } = storeToRefs(useConfig())

    const currentId = storeRef('archiveId', '0')
    const archiveInfo = storeReactive<Record<string, IArchiveInfo>>('archiveInfo', {})
    const currentInfo = computed(() => archiveInfo[currentId.value])

    const archiveData = shallowReactive({} as IArchiveData)

    const archiveItemHooks: Array<{
        load: (data: IArchiveData) => (newId: string) => void
    }> = []

    const define = <K extends keyof IArchiveData>(
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
        watch(archiveData[name], () => {
            mitt.emit('data:archive:update', { dataName: name })
        }, { deep: true })
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
        const { length } = localStorage

        for (let i = 0; i < length; i ++) {
            const key = localStorage.key(i)
            if (! key?.startsWith(prefix)) continue

            const value = localStorage[key]
            json[key.slice(prefixLen)] = value
        }
        return Object.assign(json, { _info: toValue(archiveInfo[id]) })
    }

    const withdrawArchive = (id: string) => {
        for (const key in localStorage) {
            if (key.startsWith(id + ':')) delStorage(key)
        }
    }

    const importArchive = (id: string, portable: IPortableArchive, noInfo?: boolean) => {
        if (portable._info?.version !== ARCHIVE_VERSION) return
        if (! noInfo) archiveInfo[id] = portable._info
        delete portable['_info']

        withdrawArchive(id)
        const prefix = id + ':'
        for (const key in portable) {
            setStorageRaw(prefix + key, portable[key])
        }
    }

    const createArchive = (id: number) => {
        archiveInfo[id] = {
            title: '黙認',
            accessTime: Date.now(),
            size: 0,
            wordCount: 1,
            version: ARCHIVE_VERSION
        }
    }

    const updateActiveEdition = (doUpdate: boolean) => {
        const chain = currentInfo.value.editionChain ??= []
        if (! chain.at(- 1)?.active) {
            chain.push({
                time: Date.now(),
                device: config.value.deviceName,
                active: true
            })
        }
        else if (doUpdate) {
            chain.at(- 1)!.time = Date.now()
        }
    }

    // Make sure the initial edition exists
    watch(currentId, () => {
        if (! currentInfo.value) return
        updateActiveEdition(false)
    }, { immediate: true })

    mitt.on('data:archive:update', () => {
        updateActiveEdition(true)
    })

    type IExtractArchiveData<K extends Array<keyof IArchiveData>> = {
        [key in K[number]]: WritableComputedRef<UnwrapRef<IArchiveData[key]>>
    }

    const extractData = <K extends Array<keyof IArchiveData>>(keys: K): IExtractArchiveData<K> => {
        const values: any = {}
        keys.forEach(key => {
            values[key] = computed({
                get: () => archiveData[key].value,
                set: (v) => archiveData[key].value = v
            })
        })
        return values as IExtractArchiveData<K>
    }

    return {
        currentId, archiveInfo, currentInfo, archiveData,
        extractData, define,
        disposeArchive, reloadArchive, exportArchive, withdrawArchive, importArchive, createArchive, updateActiveEdition
    }
})
