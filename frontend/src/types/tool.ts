import { Ref, UnwrapNestedRefs, UnwrapRef } from "vue"

export type ValueOf<T> = T[keyof T]

export type EntryOf<T> = [keyof T, ValueOf<T>]

export type KeyOfUnion<T> = T extends T ? keyof T : never

export type DistributivePick<T, K extends KeyOfUnion<T>> = T extends T
    ? Pick<T, Exclude<K, keyof T>>
    : never
export type DistributiveOmit<T, K extends KeyOfUnion<T>> = T extends T
    ? Omit<T, K>
    : never

export type ArgumentsType<T> = T extends (...args: infer U) => any ? U : never

export type UnwrapRefDict<T extends Record<string, Ref<any>>> = {
    [P in keyof T]: T[P] extends Ref<infer V> ? V : T[P]
}

export type GenericComponentInstanceType<T extends (...args: any[]) => { __ctx?: { expose(exposed: any): any } }>
    = UnwrapRefDict<ArgumentsType<Exclude<ReturnType<T>['__ctx'], undefined>['expose']>['0']>
