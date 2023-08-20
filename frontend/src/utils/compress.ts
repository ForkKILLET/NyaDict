import type { IWord, IWordGraph, IWordGraphEdge, IMemory, ITestRec, ITest, IWordDocument, ICorrect, ITestMode } from '@type'

export type IWord_Compress = {
  I: number
  D: string
  S: string
  M: IMemory_Compress
  d?: IWordDocument[]
  G?: IWordGraph_Compress
}
export const compress_IWord = {
  serialize: ({ id: I, disp: D, sub: S, mem: M, docs: d, graph: G }: IWord): IWord_Compress => ({
    I,
    D,
    S,
    M: compress_IMemory.serialize(M),
    d,
    G: G ? compress_IWordGraph.serialize(G) : undefined,
  }),
  deserialize: ({ I: id, D: disp, S: sub, M: mem, d: docs, G: graph }: IWord_Compress): IWord => ({
    id,
    disp,
    sub,
    mem: compress_IMemory.deserialize(mem),
    docs,
    graph: graph ? compress_IWordGraph.deserialize(graph) : undefined,
  })
}
export type IWordGraph_Compress = {
  I: IWordGraphEdge_Compress[]
  O: IWordGraphEdge_Compress[]
}
export const compress_IWordGraph = {
  serialize: ({ edgesIn: I, edgesOut: O }: IWordGraph): IWordGraph_Compress => ({
    I: I.map(compress_IWordGraphEdge.serialize),
    O: O.map(compress_IWordGraphEdge.serialize),
  }),
  deserialize: ({ I: edgesIn, O: edgesOut }: IWordGraph_Compress): IWordGraph => ({
    edgesIn: edgesIn.map(compress_IWordGraphEdge.deserialize),
    edgesOut: edgesOut.map(compress_IWordGraphEdge.deserialize),
  })
}
export type IWordGraphEdge_Compress = {
  S: number
  T: number
}
export const compress_IWordGraphEdge = {
  serialize: ({ sourceDoc: S, targetWord: T }: IWordGraphEdge): IWordGraphEdge_Compress => ({
    S,
    T,
  }),
  deserialize: ({ S: sourceDoc, T: targetWord }: IWordGraphEdge_Compress): IWordGraphEdge => ({
    sourceDoc,
    targetWord,
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
