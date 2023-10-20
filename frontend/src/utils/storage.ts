import { reactive, ref, watch, type Ref, type WatchStopHandle } from 'vue'
import JSON5 from 'json5'

import { kDispose, type Disposable } from '@util/disposable'
import { mitt } from '@util/mitt'

export const getStorage = <T>(key: string): T | undefined => {
    return json5TryParse(localStorage.getItem(key))
}

export const getStorgeRaw = (key: string): string | undefined => {
    return localStorage.getItem(key) ?? undefined
}

export const setStorage = <T>(key: string, value: T): void => {
    localStorage.setItem(key, json5Stringify(value))
    // mitt.emit('data:storage:write', { key })
}

export const setStorageRaw = (key: string, value: string): void => {
    localStorage.setItem(key, value)
}

export const delStorage = (key: string): void => {
    localStorage.removeItem(key)
    // mitt.emit('data:storage:write', { key })
}

export const initStorage = <T>(key: string, defaultValue: T): T => {
    let initValue = getStorage<T>(key)
    if (initValue === undefined) {
        setStorage(key, defaultValue)
        initValue = defaultValue
    }
    return initValue
}

export const storeRef = <T>(key: string, value: T): Ref<T> & Disposable => {
    const r = ref(initStorage(key, value))
    const stop = watch(r, newValue => setStorage(key, newValue))
    return Object.assign(r as Ref<T>, { [kDispose]: stop })
}

export const storeReactive = <T extends object>(key: string, value: T): T & Disposable => {
    const v = initStorage(key, value)
    for (const k in value) {
        if (! (k in v)) v[k] = value[k]
    }
    const r = reactive(v) as T
    const stop = watch(r, (newValue) => setStorage(key, newValue))
    return Object.assign(r, {
        [kDispose]: stop
    })
}

export const storeRefReactive = <T extends object>(key: string, value: T): Ref<T> & Disposable => {
    const r = storeReactive(key, value)
    return Object.assign(ref(r) as Ref<T>, { [kDispose]: r[kDispose] })
}

export type ArrayStore<T> = T[] & {
    set: (index: number, value: T) => T
    remove: (index: number) => boolean
    swapRemove: (index: number) => number
    reload: () => void
}

export const storeArray = <T extends object, U>(key: string, options: {
    onInit?: (store: T[]) => void
    map?: {
        serialize: (value: T) => U
        deserialize: (mappedValue: U) => T
    }
} = {}): Ref<ArrayStore<T>> & Disposable => {
    const lengthKey = `${key}$length`

    const arr: ArrayStore<T> = Object.assign(Array<T>(length), {
        set: (index: number, value: T) => update(index, value),
        push: (...items: T[]) => {
            const length = arr.length
            items.forEach((value, i) => {
                update(length + i, value)
                watchIndex(length + i)
            })
            return updateLength()
        },
        splice: (start: number, deleteCount?: number): T[] => {
            const len = arr.length
            if (start < 0) start = Math.max(len + start, 0)
            else start = Math.min(start, len)


            deleteCount = Math.min(deleteCount ?? len, len - start)

            const removed = Array(deleteCount)

            for (let i = 0; i < deleteCount; i ++) {
                const from = start + i;
                if (from in arr) removed[i] = arr[from]
            }

            for (let i = start; i < len - start - deleteCount; i ++) {
                update(i, arr[i + deleteCount])
            }

            arr.length = len - deleteCount
            updateLength()
            
            return removed
        },
        remove: (index: number) => remove(index),
        swapRemove: (index: number): number => {
            if (index !== arr.length - 1) update(index, arr[arr.length - 1])
            remove(arr.length - 1)
            reactiveArr.length --
            return updateLength()
        },
        reload: () => {
            watchStopHandles.forEach(stop => stop())
            reactiveArr.splice(0)
            load()
        }
    })
    
    let isInit = false
    const load = () => {
        let length = getStorage<number>(lengthKey)
        if (length === undefined) isInit = true
        length ??= 0

        for (let i = 0; i < length; i ++) {
            const str = localStorage.getItem(`${key}$${i}`)
            if (str === null) continue
            const value = json5Parse(str)
            arr[i] = options.map ? options.map.deserialize(value) : value
        }
    }
    load()

    const reactiveArr = reactive(arr) as ArrayStore<T>

    const updateLength = () => {
        setStorage(lengthKey, arr.length)
        return arr.length
    }
    const update = (index: number, value: T) => {
        setStorage(
            `${key}$${index}`,
            options.map ? options.map.serialize(value) : value
        )
        return reactiveArr[+ index] = value
    }
    const remove = (index: number) => {
        unwatchIndex(index)
        delStorage(`${key}$${index}`)
        return delete reactiveArr[+ index]
    }

    const watchStopHandles: WatchStopHandle[] = []
    const unwatchIndex = (index: number) => {
        watchStopHandles[index]?.()
    }
    const watchIndex = (index: number) => {
        unwatchIndex(index)
        watchStopHandles[index] = watch(reactiveArr[index], (value) => {
            update(index, value)
        })
    }
    for (let i = 0; i < arr.length; i ++) {
        watchIndex(i) // Watch all indices
    }

    if (isInit) options.onInit?.(reactiveArr)
    return Object.assign(ref(reactiveArr) as Ref<ArrayStore<T>>, {
        [kDispose]: () => {
            watchStopHandles.forEach(stop => stop())
        }
    })
}

export const json5Stringify = (value: any, quote = `'`): string => JSON5.stringify(value, { quote })
export const json5Parse = (json: string): any => JSON5.parse(json)
export const json5TryParse = (json: string | undefined | null): any | undefined => {
    if (! json) return
    try {
        return json5Parse(json)
    }
    catch {}
}
