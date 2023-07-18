export const kDispose = Symbol('dispose')

export type KDispose = typeof kDispose

export type Disposable = { [kDispose]: () => void }
