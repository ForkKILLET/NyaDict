import type { DistributiveOmit } from '@type/tool'

// @compress { "docs": "d" }
export type IWord = {
    id: number
    disp: string
    sub: string
    tone?: number
    mem: IMemory
    docs?: IWordDocument[]
    graph?: IWordGraph
}

// @compress { "@tag": "kind" }
export type IWordDocument = IMeaningDocument | ISentenceDocument | ILinkDocument

export type IWordDocumentWithoutId = DistributiveOmit<IWordDocument, 'id'>
export type ITemplateDocument = ISentenceDocument | ILinkDocument

export const enum DocumentKind {
    Meaning,
    Sentence,
    Link
}

export enum LinkDocumentRelationship {
    SimilarMeaning,
    OppositeMeaning,
    SimilarSpelling,
    SimilarPronunciation,
    Other = -1
}

export type IWordDocumentLabel = Record<string, boolean>

// @compress { "labels": "l" }
export type IMeaningDocument = {
    id: number
    labels?: IWordDocumentLabel
    kind: DocumentKind.Meaning
    text: string
    docs: IWordDocument[]
}

// @compress { "tran": "t", "labels": "l" }
export type ISentenceDocument = {
    id: number
    labels?: IWordDocumentLabel
    kind: DocumentKind.Sentence
    lang?: string
    text: string
    tran: string
}

// @compress { "labels": "l" }
export type ILinkDocument = {
    id: number
    labels?: IWordDocumentLabel
    kind: DocumentKind.Link
    text: string
    rel: LinkDocumentRelationship
}

// @compress { "edgesIn": "I", "edgesOut": "O" }
export type IWordGraph = {
    edgesIn: IWordGraphEdge[]
    edgesOut: IWordGraphEdge[]
}

// @compress
export type IWordGraphEdge = {
    sourceDoc: number
    targetWord: number
}

// @compress { "testAfter": "TT", "createTime": "TC" }
export type IMemory = {
    easiness: number
    testAfter: number
    correctCount: number
    wrongCount: number
    halfCorrectCount: number
    createTime: number
    testRec: ITestRec[] 
}

export type ICorrect = 0 | 0.5 | 1

// @compress { "oldEasiness": "E", "testId": "t" }
export type ITestRec = {
    time: number
    correct: ICorrect
    mode: TestMode
    oldEasiness: number
    testId?: number
}

export type IWordSortMethod =
    | 'id' | 'easiness' | 'correctCount' | 'wrongCount' | 'halfCorrectCount'
    | 'createTime' | 'acc' | 'yomikata' | 'testTime'
export type ISortDirection = 'up' | 'down'

export type IWordSorter = {
    method: IWordSortMethod
    direction: ISortDirection
}

export type IWordFilterModiferName = 'rei' | 'kai' | 'aku' 

export type IWordFilter = {
    query: string
}

export enum TestMode {
    Disp,
    Sub,
    Meaning
}

export enum MemMode {
    All = - 1,
    Disp = TestMode.Disp,
    Sub = TestMode.Sub,
    Meaning = TestMode.Meaning,
}

// @compress { "accessTime": "TA", "createTime": "TC", "currentIndex": "IC", "maxIndex": "IM", "lockTime": "TL" }
export type ITest = {
    id: number
    createTime: number
    accessTime: number
    mode: TestMode
    wordIds: number[]
    currentIndex: number
    maxIndex: number
    correctness: ICorrect[]
    recIds: number[]
    locked: boolean
    lockTime?: number
    docIds?: number[]
}

export type IArchiveVersion = '2' | '3' | '3.1'

export type IArchiveInfo = {
    version: IArchiveVersion
    remoteId?: string
    title: string
    accessTime: number
    size: number
    wordCount?: number
    editionChain?: IArchiveEdition[]
}

export type IArchiveEdition = {
    time: number
    device: string
    active?: true
}

export interface IArchiveData {}

export type IPortableArchive = Record<string, string> & {
    _info?: IArchiveInfo
}
