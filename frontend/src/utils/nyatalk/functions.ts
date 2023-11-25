import dayjs, { Dayjs } from 'dayjs'

import { unreachable } from '@util'
import { strictToHiragana } from '@util/kana'

import { getWordMeanings, getWordSentenceTexts } from '@store/words'

import type  { ITest, ITestRec } from '@type'
import type { IncSub10, IntSub10 } from '@type/tool'

import type {
    INtDataType, INtCalcCtx, INtFunc, SymbolChars
} from '.'

const _basicTypeStrs = [ 'String', 'Boolean', 'Number', 'Date', 'TestRec', 'Test' ] as const
const _typeVarStrs = [ 'a', 'b', 'c' ] as const
const _genericTypeStrs = [ 'List', 'Range', 'Maybe' ] as const

export type INtDataBasicTypeStr = typeof _basicTypeStrs[number]
export type INtDataGenericTypeStr = typeof _genericTypeStrs[number]
export type INtDataTypeVarStr = typeof _typeVarStrs[number]
export type INtDataNestedMaxDepth = 2
export type INtDataNestedTypeStr<
    Depth extends IntSub10 = 0,
    Inner extends string = INtDataBasicTypeStr | INtDataTypeVarStr
> = Depth extends INtDataNestedMaxDepth
    ? never
    :   | `${INtDataGenericTypeStr}<${Inner}>`
        | `${Inner} => ${Inner}`
        | INtDataNestedTypeStr<IncSub10<Depth>, `${INtDataGenericTypeStr}<${Inner}>`>
export type INtDataTypeStr =
    | INtDataBasicTypeStr
    | INtDataTypeVarStr
    | INtDataNestedTypeStr

export type IParseNtDataTypeStr<S extends INtDataTypeStr> =
    S extends `${infer Outer}<${infer Inner}>`
        ? Inner extends INtDataTypeStr
            ? { kind: 'nested', outer: Outer, inner: IParseNtDataTypeStr<Inner> }
            : never
        : { kind: 'basic', name: S }

const _isBasicType = (typeStr: INtDataTypeStr): typeStr is INtDataBasicTypeStr => _basicTypeStrs.includes(typeStr as INtDataBasicTypeStr)
const _isTypeVar = (typeStr: INtDataTypeStr): typeStr is INtDataTypeVarStr => _typeVarStrs.includes(typeStr as INtDataTypeVarStr)

const _parseType = (typeStr: INtDataTypeStr): INtDataType => {
    if (_isBasicType(typeStr)) return {
        kind: 'basic',
        name: typeStr
    }
    if (_isTypeVar(typeStr)) return {
        kind: 'typevar',
        name: typeStr
    }

    const nestedRes = typeStr.match(/(?<outer>[a-zA-Z]+)<(?<inner>[a-zA-Z]+)>/)?.groups as {
        outer: INtDataGenericTypeStr
        inner: INtDataBasicTypeStr
    }
    if (nestedRes) return {
        kind: 'nested',
        outer: nestedRes.outer,
        inner: _parseType(nestedRes.inner)
    }

    throw unreachable()
}

type INtFuncSignatureConstructor = [
    INtDataTypeStr[],
    (ctx: INtCalcCtx , ...args: any[]) => any
]

const _newSig = ([ types, body ]: INtFuncSignatureConstructor) => ({
    types: types.map(_parseType),
    body
})

const _newFunc = (sigs: INtFuncSignatureConstructor[]): INtFunc => ({
    sigs: sigs.map(_newSig)
})

const _textMatchingFunc = (fn: (search: string) => (base: string) => boolean) => _newFunc([
    [ [ 'List<String>', 'String', 'Boolean' ], (_, bases: string[], search: string) => bases.some(fn(search)) ],
    [ [ 'String', 'String', 'Boolean' ], (_, base: string, search: string) => fn(search)(base)  ]
])

const compareOperatorNames = [ '==', '<', '>', '<=', '>=', '!=' ] as const
type INtCompareOperatorName = typeof compareOperatorNames[number]
type INtCompareOperators = Record<INtCompareOperatorName, INtFunc>

const _compareFuncs = (types: [type: INtDataTypeStr, fn: (a: any, b: any) => number][]): INtCompareOperators => {
    const defs = Object.fromEntries(compareOperatorNames
        .map((name): [ INtCompareOperatorName, INtFunc ] =>
            [ name, { sigs: [] } ]
        )
    ) as INtCompareOperators
    types.forEach(([ type, cmp ]) => {
        const sigHead: INtDataTypeStr[] = [ type, type, 'Boolean' ]
        defs['=='].sigs.push(_newSig([ sigHead, (_, a, b) => cmp(a, b) == 0 ]))
        defs['<'].sigs.push(_newSig([ sigHead, (_, a, b) => cmp(a, b) < 0 ]))
        defs['>'].sigs.push(_newSig([ sigHead, (_, a, b) => cmp(a, b) > 0 ]))
        defs['<='].sigs.push(_newSig([ sigHead, (_, a, b) => cmp(a, b) <= 0 ]))
        defs['>='].sigs.push(_newSig([ sigHead, (_, a, b) => cmp(a, b) >= 0 ]))
        defs['!='].sigs.push(_newSig([ sigHead, (_, a, b) => cmp(a, b) !== 0 ]))
    })
    return defs
}

const _constFunc = (valueType: INtDataTypeStr, value: any) => _newFunc([
    [ [ valueType ], () => value  ]
])

const _ctxConstFunc = (valueType: INtDataTypeStr, body: (ctx: INtCalcCtx) => any) => _newFunc([
    [ [ valueType ], body ]
])

type INtRange<T> = {
    start: T
    end: T
}

export const funcDefs = {
    '->': _textMatchingFunc(s => b => b.includes(s)),
    '->^': _textMatchingFunc(s => b => b.startsWith(s)),
    '->$': _textMatchingFunc(s => b => b.endsWith(s)),

    kana: _newFunc([
        [ [ 'String', 'String' ], (_, str: string) => strictToHiragana(str) ?? str ]
    ]),

    empty: _newFunc([
        [ [ 'List<String>', 'Boolean' ], (_, strs: string[]) => ! strs.length ]
    ]),

    lengthOf: _newFunc([
        [ [ 'String', 'Number' ], (_, str: string) => str.length ],
        [ [ 'List<String>', 'Number' ], (_, strs: string[]) => strs.length ],
        [ [ 'List<TestRec>', 'Number' ], (_, testRecs: ITestRec[]) => testRecs.length ]
    ]),

    '#': _newFunc([
        [ [ 'List<Test>', 'Number', 'Maybe<Test>' ], (_, tests: ITest[], id: number) => tests.find(test => test.id === id) ]
    ]),

    true: _constFunc('Boolean', true),
    false: _constFunc('Boolean', false),

    now: _ctxConstFunc('Date', _ => dayjs()),

    ..._compareFuncs([
        [ 'Number', (a: number, b: number) => a - b ],
        [ 'String', (a: string, b: string) => a < b ? - 1 : a > b ? + 1 : 0 ],
        [ 'Date', (a: Dayjs, b: Dayjs) => a.valueOf() - b.valueOf() ]
    ]),

    '..': _newFunc([
        [
            [ 'Number', 'Number', 'Range<Number>' ],
            (_, start: number, end: number): INtRange<number> => ({
                start, end
            })
        ],
        [
            [ 'Date', 'Date', 'Range<Date>' ],
            (_, start: Dayjs, end: Dayjs): INtRange<Dayjs> => ({
                start, end
            })
        ]
    ]),

    '<-': _newFunc([
        [
            [ 'Number', 'Range<Number>', 'Boolean' ],
            (_, num: number, range: INtRange<number>) => range.start <= num && num <= range.end
        ],
        [
            [ 'Date', 'Range<Date>', 'Boolean' ],
            (_, date: Dayjs, range: INtRange<Dayjs>) => date.isAfter(range.start) && date.isBefore(range.end)
        ],
    ]),

    '&': _newFunc([
        [ [ 'Boolean', 'Boolean', 'Boolean' ], (_, a: boolean, b: boolean) => a && b ],
    ]),
    '|': _newFunc([
        [ [ 'Boolean', 'Boolean', 'Boolean' ], (_, a: boolean, b: boolean) => a || b ],
    ]),
    '!': _newFunc([
        [ [ 'Boolean', 'Boolean' ], (_, a: boolean) => ! a ],
    ]),

    '+': _newFunc([
        [ [ 'Number', 'Number', 'Number' ], (_, a: number, b: number) => a + b ],
        [ [ 'Date', 'Number', 'Date' ], (_, a: Dayjs, b: number) => a.add(b, 'millisecond') ],
        [ [ 'Number', 'Date', 'Date' ], (_, a: number, b: Dayjs) => b.add(a, 'millisecond') ]
    ]),
    '-': _newFunc([
        [ [ 'Number', 'Number', 'Number' ], (_, a: number, b: number) => a - b ],
        [ [ 'Date', 'Date', 'Number' ], (_, a: Dayjs, b: Dayjs) => a.diff(b, 'millisecond') ],
        [ [ 'Date', 'Number', 'Date' ], (_, a: Dayjs, b: number) => a.add(- b, 'millisecond') ]
    ]),
    '*': _newFunc([
        [ [ 'Number', 'Number', 'Number' ], (_, a: number, b: number) => a * b ]
    ]),
    '/': _newFunc([
        [ [ 'Number', 'Number', 'Number' ], (_, a: number, b: number) => a / b ]
    ]),

    easiness: _ctxConstFunc('Number', (ctx): number => ctx.currentWord.mem.easiness),

    text: _ctxConstFunc('List<String>', (ctx): string[] => [
        ctx.currentWord.disp,
        ctx.currentWord.sub,
    ]),
    disp: _ctxConstFunc('String', (ctx): string => ctx.currentWord.disp),
    sub: _ctxConstFunc('String', (ctx): string => ctx.currentWord.sub,),
    meaning: _ctxConstFunc('List<String>', (ctx): string[] => (
        getWordMeanings(ctx.currentWord)
    )),
    sentence: _ctxConstFunc('List<String>', (ctx): string[] => (
        getWordSentenceTexts(ctx.currentWord)
    )),
    doc: _ctxConstFunc('List<String>', (ctx): string[] => [
        ...getWordMeanings(ctx.currentWord),
        ...getWordSentenceTexts(ctx.currentWord)
    ]),
    
    hour: _newFunc([
       [ [ 'Number', 'Number' ], (_, x: number) => x * 3600 * 1000 ] 
    ]),
    day: _newFunc([
        [ [ 'Number', 'Number' ], (_, x: number) => x * 24 * 3600 * 1000 ]
    ]),
    month: _newFunc([
        [ [ 'Number', 'Number' ], (_, x: number) => x * 30 * 24 * 3600 * 1000 ]
    ]),
    year: _newFunc([
        [ [ 'Number', 'Number' ], (_, x: number) => x * 365 * 24 * 3600 * 1000 ]
    ]),

    testable: _ctxConstFunc('Boolean', (ctx): boolean => ctx.currentWord.mem.testAfter < Date.now()),

    createTime: _ctxConstFunc('Date', (ctx): Dayjs => dayjs(ctx.currentWord.mem.createTime)),
    nextTestTime: _ctxConstFunc('Date', (ctx): Dayjs => dayjs(ctx.currentWord.mem.testAfter)),

    correct: _constFunc('Number', 1),
    halfCorrect: _constFunc('Number', 0.5),
    wrong: _constFunc('Number', 0),
    
    testRec: _ctxConstFunc('List<TestRec>', (ctx): ITestRec[] => ctx.currentWord.mem.testRec),
    tests: _ctxConstFunc('List<Test>', (ctx): ITest[] => ctx.tests),
    inTest: _newFunc([
        [
            [ 'Maybe<Test>', 'Boolean' ],
            (ctx, test: ITest | undefined) => test?.wordIds.includes(ctx.currentWord.id)
        ],
        [
            [ 'Maybe<Test>', 'Number', 'Boolean' ],
            (ctx, test: ITest | undefined, maxCorr: number): boolean => { // TODO: cache
                if (! test) return false
                const index = test.wordIds.findIndex(id => id === ctx.currentWord.id)
                if (index < 0) return false
                const corr = test.corrs[index]
                if (corr === undefined) return false
                return corr >= maxCorr
            }
        ]
    ]),

    // TODO: high order functions

    // ':': _newFunc([
    //     [ [ 'a', 'a => b', 'b' ], <T, U>(_: INtCalcCtx, x: T, f: (x: T) => U): U => f(x) ]
    // ]),

    // map: _newFunc([
    //     [ [ 'List<a>', 'a => b', 'List<b>' ], <T, U>(_: INtCalcCtx, xs: T[], f: (x: T) => U): U[] => xs.map(f) ]
    // ])
} as const

export const funcAliases = {
    'contains': '->',
    'startswith': '->^',
    'endswith': '->$',
    'and': '&',
    'or': '|',
    'not': '!',
    'equals': '==',
    'in': '<-'
} as const

export type INtFuncName = keyof typeof funcDefs | keyof typeof funcAliases
export type INtOperatorName = {
    [K in INtFuncName]: K extends `${SymbolChars}${string}` ? K : never
}[INtFuncName]

export const symbolPriority: Record<INtOperatorName, number> = {
    '|': 3,
    '&': 4,

    '<': 5,
    '>': 5,
    '<=': 5,
    '>=': 5,

    '<-': 5,
    '->': 5,
    '->^': 5,
    '->$': 5,

    '==': 6,
    '!=': 6,

    '..': 7,

    '+': 8,
    '-': 8,

    '*': 9,
    '/': 9,

    '#': 10,

    '!': 11 // TODO: prefix precedence
}
