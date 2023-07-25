// @compress
export type IWord = {
    id: number
    disp: string
    sub: string
    mem: IMemory
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

// @compress { "accessTime": "TA", "createTime": "TC", "currentIndex": "IC", "maxIndex": "IM" }
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
