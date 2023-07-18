export type ValueOf<T> = T[keyof T]

export type EntryOf<T> = [keyof T, ValueOf<T>]
