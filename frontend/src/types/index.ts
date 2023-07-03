export type IWord = {
    id: number
    disp: string
    sub: string
    desc?: string
    mem: IMemory
}

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

export type ITestRec = {
    time: number
    correct: ICorrect
    mode: ITestMode
}

export type ITestMode = 'disp' | 'sub'

export type ITest = {
    createTime: number
    accessTime: number
    mode: ITestMode
    wordIds: number[]
    currentIndex: number
    correctness: ICorrect[]
    completed: boolean
}

export type IMemMode = 'disp' | 'sub' | 'both'

export type IArchiveInfo = {
    remoteId?: string
    title: string
    accessTime: number
    size: number
    wordCount?: number
}
