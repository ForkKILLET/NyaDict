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

export type ITestMode = 'disp' | 'sub' | 'desc'
