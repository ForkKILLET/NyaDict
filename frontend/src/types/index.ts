export type IWord = {
    id: number
    disp: string
    sub: string
    desc?: string
    mem: IMemory
}

export type IMemory = {
    correctNum: number
    wrongNum: number
    createTime: number
    testRec: ITestRec[] 
}

export type ITestRec = {
    time: number
    correct: boolean
    mode: ITestMode
}

export type ITestMode = 'disp' | 'sub'

export type ITest = {
    createTime: number
    accessTime: number
    mode: ITestMode
    wordIds: number[]
    currentIndex: number
    correctness: boolean[]
    completed: boolean
}

export type IMemMode = 'disp' | 'sub' | 'both'
