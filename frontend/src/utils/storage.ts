import { tryJSON } from '.'

export const getStorage = <T>(key: string): T | undefined => {
    return tryJSON(localStorage.getItem(key))
}

export const setStorage = <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value))
}
