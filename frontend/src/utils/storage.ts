import { reactive, ref, UnwrapNestedRefs, watch } from 'vue'
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

export const storageRef = <T>(key: string, value: T) => {
    const r = ref(initStorage(key, value))
    watch(r, newValue => setStorage(key, newValue))
    return r
}

export const storageReactive = <T extends object>(key: string, value: T): UnwrapNestedRefs<T> => {
    const r = reactive<T>(initStorage(key, value))
    watch(r, (newValue) => setStorage(key, newValue))
    return r
}
