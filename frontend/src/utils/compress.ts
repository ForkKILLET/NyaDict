import type { IWord, IMemory, ITestRec, ITest, ICorrect, ITestMode } from '@type'

export type IWord_Compress = {
  I: number
  D: string
  S: string
  M: IMemory_Compress
}
export const compress_IWord = {
  serialize: ({ id: I, disp: D, sub: S, mem: M }: IWord) => ({
    I,
    D,
    S,
    M: compress_IMemory.serialize(M),
  }),
  deserialize: ({ I: id, D: disp, S: sub, M: mem }: IWord_Compress) => ({
    id,
    disp,
    sub,
    mem: compress_IMemory.deserialize(mem),
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
  serialize: ({ easiness: E, testAfter: TT, correctCount: C, wrongCount: W, halfCorrectCount: H, createTime: TC, testRec: T }: IMemory) => ({
    E,
    TT,
    C,
    W,
    H,
    TC,
    T: T.map(compress_ITestRec.serialize),
  }),
  deserialize: ({ E: easiness, TT: testAfter, C: correctCount, W: wrongCount, H: halfCorrectCount, TC: createTime, T: testRec }: IMemory_Compress) => ({
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
  serialize: ({ time: T, correct: C, mode: M, oldEasiness: E }: ITestRec) => ({
    T,
    C,
    M,
    E,
  }),
  deserialize: ({ T: time, C: correct, M: mode, E: oldEasiness }: ITestRec_Compress) => ({
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
  L: boolean
}
export const compress_ITest = {
  serialize: ({ id: I, createTime: TC, accessTime: TA, mode: M, wordIds: W, currentIndex: IC, maxIndex: IM, correctness: C, locked: L }: ITest) => ({
    I,
    TC,
    TA,
    M,
    W,
    IC,
    IM,
    C,
    L,
  }),
  deserialize: ({ I: id, TC: createTime, TA: accessTime, M: mode, W: wordIds, IC: currentIndex, IM: maxIndex, C: correctness, L: locked }: ITest_Compress) => ({
    id,
    createTime,
    accessTime,
    mode,
    wordIds,
    currentIndex,
    maxIndex,
    correctness,
    locked,
  })
}