import {
  DocumentKind,
  ICorrect,
  ILinkDocument,
  IMeaningDocument,
  IMemory,
  ISentenceDocument,
  ITest,
  ITestRec,
  IWord,
  IWordDocument,
  IWordGraph,
  IWordGraphEdge,
  LinkDocumentRelationship,
  TestMode,
} from '@type'

export type IWord_Compress = {
  I: number
  D: string
  S: string
  M: IMemory_Compress
  d?: IWordDocument_Compress[]
  G?: IWordGraph_Compress
}
export const compress_IWord = {
  serialize: ({ id: I, disp: D, sub: S, mem: M, docs: d, graph: G }: IWord): IWord_Compress => ({
    I,
    D,
    S,
    M: compress_IMemory.serialize(M),
    d: d?.map(compress_IWordDocument.serialize),
    G: G ? compress_IWordGraph.serialize(G) : undefined,
  }),
  deserialize: ({ I: id, D: disp, S: sub, M: mem, d: docs, G: graph }: IWord_Compress): IWord => ({
    id,
    disp,
    sub,
    mem: compress_IMemory.deserialize(mem),
    docs: docs?.map(compress_IWordDocument.deserialize),
    graph: graph ? compress_IWordGraph.deserialize(graph) : undefined,
  })
}

export type IWordDocument_Compress = IMeaningDocument_Compress | ISentenceDocument_Compress | ILinkDocument_Compress
export const compress_IWordDocument = {
  serialize: (union: IWordDocument): IWordDocument_Compress => {
    if (union.kind === DocumentKind.Meaning) return compress_IMeaningDocument.serialize(union)
    else if (union.kind === DocumentKind.Sentence) return compress_ISentenceDocument.serialize(union)
    else if (union.kind === DocumentKind.Link) return compress_ILinkDocument.serialize(union)
    else return undefined as never
  },
  deserialize: (union: IWordDocument_Compress): IWordDocument => {
    if (union.K === DocumentKind.Meaning) return compress_IMeaningDocument.deserialize(union)
    else if (union.K === DocumentKind.Sentence) return compress_ISentenceDocument.deserialize(union)
    else if (union.K === DocumentKind.Link) return compress_ILinkDocument.deserialize(union)
    else return undefined as never
  }
}

export type IMeaningDocument_Compress = {
  I: number
  K: DocumentKind.Meaning
  T: string
  D: IWordDocument_Compress[]
}
export const compress_IMeaningDocument = {
  serialize: ({ id: I, kind: K, text: T, docs: D }: IMeaningDocument): IMeaningDocument_Compress => ({
    I,
    K,
    T,
    D: D.map(compress_IWordDocument.serialize),
  }),
  deserialize: ({ I: id, K: kind, T: text, D: docs }: IMeaningDocument_Compress): IMeaningDocument => ({
    id,
    kind,
    text,
    docs: docs.map(compress_IWordDocument.deserialize),
  })
}

export type ISentenceDocument_Compress = {
  I: number
  K: DocumentKind.Sentence
  L?: string
  T: string
  t: string
}
export const compress_ISentenceDocument = {
  serialize: ({ id: I, kind: K, lang: L, text: T, tran: t }: ISentenceDocument): ISentenceDocument_Compress => ({
    I,
    K,
    L,
    T,
    t,
  }),
  deserialize: ({ I: id, K: kind, L: lang, T: text, t: tran }: ISentenceDocument_Compress): ISentenceDocument => ({
    id,
    kind,
    lang,
    text,
    tran,
  })
}

export type ILinkDocument_Compress = {
  I: number
  K: DocumentKind.Link
  T: string
  R: LinkDocumentRelationship
}
export const compress_ILinkDocument = {
  serialize: ({ id: I, kind: K, text: T, rel: R }: ILinkDocument): ILinkDocument_Compress => ({
    I,
    K,
    T,
    R,
  }),
  deserialize: ({ I: id, K: kind, T: text, R: rel }: ILinkDocument_Compress): ILinkDocument => ({
    id,
    kind,
    text,
    rel,
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
  M: TestMode
  E: number
  t?: number
}
export const compress_ITestRec = {
  serialize: ({ time: T, correct: C, mode: M, oldEasiness: E, testId: t }: ITestRec): ITestRec_Compress => ({
    T,
    C,
    M,
    E,
    t,
  }),
  deserialize: ({ T: time, C: correct, M: mode, E: oldEasiness, t: testId }: ITestRec_Compress): ITestRec => ({
    time,
    correct,
    mode,
    oldEasiness,
    testId,
  })
}

export type ITest_Compress = {
  I: number
  TC: number
  TA: number
  M: TestMode
  W: number[]
  IC: number
  IM: number
  C: ICorrect[]
  R: number[]
  L: boolean
  TL?: number
  D?: number[]
}
export const compress_ITest = {
  serialize: ({ id: I, createTime: TC, accessTime: TA, mode: M, wordIds: W, currentIndex: IC, maxIndex: IM, correctness: C, recIds: R, locked: L, lockTime: TL, docIds: D }: ITest): ITest_Compress => ({
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
    D,
  }),
  deserialize: ({ I: id, TC: createTime, TA: accessTime, M: mode, W: wordIds, IC: currentIndex, IM: maxIndex, C: correctness, R: recIds, L: locked, TL: lockTime, D: docIds }: ITest_Compress): ITest => ({
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
    docIds,
  })
}

