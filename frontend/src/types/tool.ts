import { Ref } from "vue"

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

export type MAXIMUM_ALLOWED_BOUNDARY = 10

export type Last<T extends string[]> = T extends [...infer _, infer Last] ? Last : never;

export type ConcatPrevious<S extends string, T extends any[]> = Last<T> extends string ? `${Last<T>}${S}` : never

export type RepeatedArray<
    S extends string,
    Result extends unknown[] = [S],
> = Result['length'] extends MAXIMUM_ALLOWED_BOUNDARY
    ? Result
    : RepeatedArray<S, [...Result, ConcatPrevious<S, Result>]>

export type Repeated<S extends string> = RepeatedArray<S>[number]

export type UnwrapRefDict<T extends Record<string, Ref<any>>> = {
    [P in keyof T]: T[P] extends Ref<infer V> ? V : T[P]
}

export type GenericComponentInstanceType<T extends (...args: any[]) => { __ctx?: { expose(exposed: any): any } }>
    = UnwrapRefDict<ArgumentsType<Exclude<ReturnType<T>['__ctx'], undefined>['expose']>['0']>
