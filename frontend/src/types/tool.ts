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

export type AllCharsInString<T extends string> = T extends `${infer F}${infer L}` ? F | AllCharsInString<L> : never

export type ArgumentsType<T> = T extends (...args: infer U) => any ? U : never

export type Last<T extends string[]> = T extends [...infer _, infer Last] ? Last : never;

export type ConcatPrevious<S extends string, T extends any[]> = Last<T> extends string ? `${Last<T>}${S}` : never

export type RepeatedArray<
    S extends string,
    Result extends unknown[] = [S],
> = Result['length'] extends 10
    ? Result
    : RepeatedArray<S, [...Result, ConcatPrevious<S, Result>]>

export type Repeated<S extends string> = RepeatedArray<S>[number]

export type UnwrapRefDict<T extends Record<string, Ref<any>>> = {
    [P in keyof T]: T[P] extends Ref<infer V> ? V : T[P]
}

export type GenericComponentInstanceType<T extends (...args: any[]) => { __ctx?: { expose(exposed: any): any } }>
    = UnwrapRefDict<ArgumentsType<Exclude<ReturnType<T>['__ctx'], undefined>['expose']>['0']>

export type IntSub10 = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

export type AddSub10Table = {
    0: 1,
    1: 2,
    2: 3,
    3: 4,
    4: 5,
    5: 6,
    6: 7,
    7: 8,
    8: 9,
    9: never
}

export type IncSub10<T extends IntSub10> = AddSub10Table[T]

export type RemoveIndex<T> = {
    [ K in keyof T as
        string extends K ? never :
        number extends K ? never :
        symbol extends K ? never :
        K
    ] : T[K]
}
