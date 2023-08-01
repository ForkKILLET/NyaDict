export type ValueOf<T> = T[keyof T]

export type EntryOf<T> = [keyof T, ValueOf<T>]

export type KeyOfUnion<T> = T extends T ? keyof T : never

export type DistributivePick<T, K extends KeyOfUnion<T>> = T extends T
    ? Pick<T, Exclude<K, keyof T>>
    : never
export type DistributiveOmit<T, K extends KeyOfUnion<T>> = T extends T
    ? Omit<T, K>
    : never
