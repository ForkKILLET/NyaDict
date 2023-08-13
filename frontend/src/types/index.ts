import type { DistributiveOmit } from "@type/tool"

// @compress { "docs": "d" }
export type IWord = {
    id: number
    disp: string
    sub: string
    mem: IMemory
    docs?: IWordDocument[]
    graph?: IWordGraph
}

export type IWordDocument = IMeaningDocument | ISentenceDocument | ILinkDocument
export type IWordDocumentWithoutId = DistributiveOmit<IWordDocument, 'id'>
export type ITemplateDocument = ISentenceDocument | ILinkDocument

export enum DocumentKind {
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

export type IWordDocumentBase = {
    id: number
}

export type IMeaningDocument = IWordDocumentBase & {
    kind: DocumentKind.Meaning
    lang?: string
    text: string
    docs: IWordDocument[]
}

export type ISentenceDocument = IWordDocumentBase & {
    kind: DocumentKind.Sentence
    lang?: string
    text: string
    tran: string
}

export type ILinkDocument = IWordDocumentBase & {
    kind: DocumentKind.Link
    text: string
    rel: LinkDocumentRelationship
}

// @compress { "edgesIn": "I", "edgesOut": "O" }
export type IWordGraph = {
    edgesIn: number[]
    edgesOut: number[]
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

// @compress { "oldEasiness": "E" }
export type ITestRec = {
    time: number
    correct: ICorrect
    mode: ITestMode
    oldEasiness: number
}

export type IWordFilter = {
    search: string | null
    testId: number | null
    testCorrectLevel: number
}

export type ITestMode = 'disp' | 'sub'

// @compress { "accessTime": "TA", "createTime": "TC", "currentIndex": "IC", "maxIndex": "IM", "lockTime": "TL" }
export type ITest = {
    id: number
    createTime: number
    accessTime: number
    mode: ITestMode
    wordIds: number[]
    currentIndex: number
    maxIndex: number
    correctness: ICorrect[]
    recIds: number[]
    locked: boolean
    lockTime?: number
}

export type IMemMode = 'disp' | 'sub' | 'both'

export type IArchiveInfo = {
    version: '2' | string
    remoteId?: string
    title: string
    accessTime: number
    size: number
    wordCount?: number
}

export interface IArchiveData {}

export type IPortableArchive = Record<string, string> & {
    _info?: IArchiveInfo
}
