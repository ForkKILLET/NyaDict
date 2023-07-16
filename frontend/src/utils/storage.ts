import { reactive, ref, watch, type WatchStopHandle } from 'vue'
import { tryJSON } from '@util'

export const getStorage = <T>(key: string): T | undefined => {
    return tryJSON(localStorage.getItem(key))
}

export const setStorage = <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value))
}

export const initStorage = <T>(key: string, defaultValue: T): T => {
    let initValue = getStorage<T>(key)
    if (initValue === undefined) {
        setStorage(key, defaultValue)
        initValue = defaultValue
    }
    return initValue
}

export const storeRef = <T>(key: string, value: T) => {
    const r = ref(initStorage(key, value))
    watch(r, newValue => setStorage(key, newValue))
    return r
}

export const storeReactive = <T extends object>(key: string, value: T): T => {
    const r = reactive(initStorage(key, value)) as T
    watch(r, (newValue) => setStorage(key, newValue))
    return r
}

export type ArrayStore<T> = T[] & {
    set: (index: number, value: T) => T
    swapRemove: (index: number) => number
    reload: () => void
}

export const storeArray = <T extends object>(key: string, options: {
    onInit?: (store: T[]) => void
    map?: {
        serialize: (value: T) => string
        deserialize: (str: string) => T
    }
} = {}): ArrayStore<T> => {
    const lengthKey = `${key}#length`
    const { serialize, deserialize } = options.map ?? {
        serialize: (value: T) => JSON.stringify(value),
        deserialize: (str: string) => JSON.parse(str) as T
    }

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
        swapRemove: (index: number): number => {
            update(index, arr[arr.length - 1])
            arr.length --
            
            return updateLength()
        },
        reload: () => {
            watchStopHandles.forEach(stop => stop())
            reactiveArr.splice(0)
            load()
        }
    })
    const reactiveArr = reactive(arr) as ArrayStore<T>
    
    let isInit = false
    const load = () => {
        let length = getStorage<number>(lengthKey)
        if (length === undefined) isInit = true
        length ??= 0

        for (let i = 0; i < length; i ++) {
            const str = localStorage.getItem(`${key}#${i}`)
            if (str === null) continue
            arr[i] = deserialize(str)
        }
    }
    load()

    const updateLength = () => {
        setStorage(lengthKey, arr.length)
        return arr.length
    }
    const update = (index: string | number, value: T) => {
        reactiveArr[+ index] = value
        localStorage.setItem(`${key}#${index}`, serialize(value))
        console.trace(`[Array Store] ${key}#${index} = %o`, value)
        return value
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
        watchIndex(i) // watch all indices
    }

    if (isInit) options.onInit?.(reactiveArr)
    return reactiveArr
}

Object.assign(window, { storeArray })
