import { unreachable } from '@util'
import type {
    IQueryCalcCtx, IQueryDataType, IQueryFunc, IQueryFuncSignature, SymbolChars
} from '@util/filterQuery'
import { strictToHiragana } from '@util/kana'

import { getWordMeanings, getWordSentences } from '@store/words'

import { IncSub10, IntSub10 } from '@type/tool'

const _basicTypeStrs = [ 'String', 'Boolean', 'Number' ] as const
const _genericTypeStrs = [ 'List' ] as const

export type IQueryDataBasicTypeStr = typeof _basicTypeStrs[number]
export type IQueryDataGenericTypeStr = typeof _genericTypeStrs[number]
export type IQueryDataNestedMaxDepth = 2
export type IQueryDataNestedTypeStr<Depth extends IntSub10 = 0, Inner extends string = IQueryDataBasicTypeStr> = Depth extends IQueryDataNestedMaxDepth
    ? never
    : `${IQueryDataGenericTypeStr}<${Inner}>` | IQueryDataNestedTypeStr<IncSub10<Depth>, `${IQueryDataGenericTypeStr}<${Inner}>`>
export type IQueryDataTypeStr = IQueryDataBasicTypeStr | IQueryDataNestedTypeStr

export type ParseQueryDataTypeStr<S extends IQueryDataTypeStr> =
    S extends `${infer Outer}<${infer Inner}>`
        ? Inner extends IQueryDataTypeStr
            ? { kind: 'nested', outer: Outer, inner: ParseQueryDataTypeStr<Inner> }
            : never
        : { kind: 'basic', name: S }

const _isBasicType = (typeStr: IQueryDataTypeStr): typeStr is IQueryDataBasicTypeStr => _basicTypeStrs.includes(typeStr as IQueryDataBasicTypeStr)

const _parseType = (typeStr: IQueryDataTypeStr): IQueryDataType => {
    if (_isBasicType(typeStr)) return {
        kind: 'basic',
        name: typeStr
    }
    const nestedRes = typeStr.match(/(?<outer>[a-zA-Z]+)<(?<inner>[a-zA-Z]+)>/)?.groups as {
        outer: IQueryDataGenericTypeStr
        inner: IQueryDataBasicTypeStr
    }
    if (nestedRes) return {
        kind: 'nested',
        outer: nestedRes.outer,
        inner: _parseType(nestedRes.inner)
    }

    throw unreachable()
}

type IQueryFuncSignatureConstructor = [
    IQueryDataTypeStr[],
    (ctx: IQueryCalcCtx , ...args: any[]) => any
]

const _newSig = ([ types, body ]: IQueryFuncSignatureConstructor) => ({
    types: types.map(_parseType),
    body
})

const _newFunc = (sigs: IQueryFuncSignatureConstructor[]): IQueryFunc => ({
    sigs: sigs.map(_newSig)
})

const _textMatchingFunc = (fn: (search: string) => (base: string) => boolean) => _newFunc([
    [ [ 'List<String>', 'String', 'Boolean' ], (_, bases: string[], search: string) => bases.some(fn(search)) ],
    [ [ 'String', 'String', 'Boolean' ], (_, base: string, search: string) => fn(search)(base)  ]
])

const compareOperatorNames = [ '==', '<', '>', '<=', '>=', '!=' ] as const
type IQueryCompareOperatorName = typeof compareOperatorNames[number]
type IQueryCompareOperators = Record<IQueryCompareOperatorName, IQueryFunc>

const _compareFuncs = <T>(types: [type: IQueryDataTypeStr, fn: (a: T, b: T) => number][]): IQueryCompareOperators => {
    const defs = Object.fromEntries(compareOperatorNames
        .map((name): [ IQueryCompareOperatorName, IQueryFunc ] =>
            [ name, { sigs: [] } ]
        )
    ) as IQueryCompareOperators
    types.forEach(([ type, cmp ]) => {
        const sigHead: IQueryDataTypeStr[] = [ type, type, 'Boolean' ]
        defs['=='].sigs.push(_newSig([ sigHead, (_, a, b) => cmp(a, b) == 0 ]))
        defs['<'].sigs.push(_newSig([ sigHead, (_, a, b) => cmp(a, b) < 0 ]))
        defs['>'].sigs.push(_newSig([ sigHead, (_, a, b) => cmp(a, b) > 0 ]))
        defs['<='].sigs.push(_newSig([ sigHead, (_, a, b) => cmp(a, b) <= 0 ]))
        defs['>='].sigs.push(_newSig([ sigHead, (_, a, b) => cmp(a, b) <= 0 ]))
        defs['!='].sigs.push(_newSig([ sigHead, (_, a, b) => cmp(a, b) !== 0 ]))
    })
    return defs
}

const _constFunc = (valueType: IQueryDataTypeStr, value: any) => _newFunc([
    [ [ valueType ], () => value  ]
])

const _ctxConstFunc = (valueType: IQueryDataTypeStr, body: (ctx: IQueryCalcCtx) => any) => _newFunc([
    [ [ valueType ], body ]
])

export const funcDefs = {
    equals: _textMatchingFunc(s => b => b === s),
    contains: _textMatchingFunc(s => b => b.includes(s)),
    startswith: _textMatchingFunc(s => b => b.startsWith(s)),
    endswith: _textMatchingFunc(s => b => b.endsWith(s)),

    kana: _newFunc([
        [ [ 'String', 'String' ], (_, str: string) => strictToHiragana(str) ?? str ]
    ]),

    empty: _newFunc([
        [ [ 'List<String>', 'Boolean' ], (_, strs: string[]) => ! strs.length ]
    ]),

    true: _constFunc('Boolean', true),
    false: _constFunc('Boolean', false),

    ..._compareFuncs([
        [ 'Number', (a: number, b: number) => a - b ]
    ]),

    and: _newFunc([
        [ [ 'Boolean', 'Boolean', 'Boolean' ], (_, a: boolean, b: boolean) => a && b ],
    ]),
    or: _newFunc([
        [ [ 'Boolean', 'Boolean', 'Boolean' ], (_, a: boolean, b: boolean) => a || b ],
    ]),
    not: _newFunc([
        [ [ 'Boolean', 'Boolean' ], (_, a: boolean) => ! a ],
    ]),

    '+': _newFunc([
        [ [ 'Number', 'Number', 'Number' ], (_, a: number, b: number) => a + b ]
    ]),
    '-': _newFunc([
        [ [ 'Number', 'Number', 'Number' ], (_, a: number, b: number) => a - b ]
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
        getWordSentences(ctx.currentWord)
    )),
    doc: _ctxConstFunc('List<String>', (ctx): string[] => [
        ...getWordMeanings(ctx.currentWord),
        ...getWordSentences(ctx.currentWord)
    ]),

    testable: _ctxConstFunc('Boolean', (ctx): boolean => ctx.currentWord.mem.testAfter < Date.now())
} as const

export const funcAliases = {
    '->': 'contains',
    '->^': 'startswith',
    '->$': 'endswith',
    '&': 'and',
    '|': 'or',
    '!': 'not'
} as const

export type IQueryFuncName = keyof typeof funcDefs | keyof typeof funcAliases
export type IQueryOperatorName = {
    [K in IQueryFuncName]: K extends `${SymbolChars}${string}` ? K : never
}[IQueryFuncName]

export const symbolPriority: Record<IQueryOperatorName, number> = {
    '|': 3,
    '&': 4,

    '<': 5,
    '>': 5,
    '<=': 5,
    '>=': 5,
    
    '->': 5,
    '->^': 5,
    '->$': 5,

    '==': 6,
    '!=': 6,

    '+': 6,
    '-': 6,

    '*': 7,
    '/': 7,

    '!': 8 // TODO: prefix
}

