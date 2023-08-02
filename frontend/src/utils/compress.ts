import type { IWord, IMemory, ITestRec, ITest, IWordDocuments, ICorrect, ITestMode } from '@type'

export type IWord_Compress = {
  I: number
  D: string
  S: string
  M: IMemory_Compress
  d?: IWordDocuments
}
export const compress_IWord = {
  serialize: ({ id: I, disp: D, sub: S, mem: M, doc: d }: IWord): IWord_Compress => ({
    I,
    D,
    S,
    M: compress_IMemory.serialize(M),
    d,
  }),
  deserialize: ({ I: id, D: disp, S: sub, M: mem, d: doc }: IWord_Compress): IWord => ({
    id,
    disp,
    sub,
    mem: compress_IMemory.deserialize(mem),
    doc,
  })
}
export type IMemory_Compress = {
  E: number
  TT: number
  C: number
  W: number
  H: number
  TC: number
  T: ITestRec_Compress[]
}
export const compress_IMemory = {
  serialize: ({ easiness: E, testAfter: TT, correctCount: C, wrongCount: W, halfCorrectCount: H, createTime: TC, testRec: T }: IMemory): IMemory_Compress => ({
    E,
    TT,
    C,
    W,
    H,
    TC,
    T: T.map(compress_ITestRec.serialize),
  }),
  deserialize: ({ E: easiness, TT: testAfter, C: correctCount, W: wrongCount, H: halfCorrectCount, TC: createTime, T: testRec }: IMemory_Compress): IMemory => ({
    easiness,
    testAfter,
    correctCount,
    wrongCount,
    halfCorrectCount,
    createTime,
    testRec: testRec.map(compress_ITestRec.deserialize),
  })
}
export type ITestRec_Compress = {
  T: number
  C: ICorrect
  M: ITestMode
  E: number
}
export const compress_ITestRec = {
  serialize: ({ time: T, correct: C, mode: M, oldEasiness: E }: ITestRec): ITestRec_Compress => ({
    T,
    C,
    M,
    E,
  }),
  deserialize: ({ T: time, C: correct, M: mode, E: oldEasiness }: ITestRec_Compress): ITestRec => ({
    time,
    correct,
    mode,
    oldEasiness,
  })
}
export type ITest_Compress = {
  I: number
  TC: number
  TA: number
  M: ITestMode
  W: number[]
  IC: number
  IM: number
  C: ICorrect[]
  R: number[]
  L: boolean
  TL?: number
}
export const compress_ITest = {
  serialize: ({ id: I, createTime: TC, accessTime: TA, mode: M, wordIds: W, currentIndex: IC, maxIndex: IM, correctness: C, recIds: R, locked: L, lockTime: TL }: ITest): ITest_Compress => ({
    I,
    TC,
    TA,
    M,
    W,
    IC,
    IM,
    C,
    R,
    L,
    TL,
  }),
  deserialize: ({ I: id, TC: createTime, TA: accessTime, M: mode, W: wordIds, IC: currentIndex, IM: maxIndex, C: correctness, R: recIds, L: locked, TL: lockTime }: ITest_Compress): ITest => ({
    id,
    createTime,
    accessTime,
    mode,
    wordIds,
    currentIndex,
    maxIndex,
    correctness,
    recIds,
    locked,
    lockTime,
  })
}
