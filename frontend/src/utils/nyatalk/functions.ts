import { unreachable } from '@util'
import { strictToHiragana } from '@util/kana'

import { getWordMeanings, getWordSentences } from '@store/words'

import { IncSub10, IntSub10 } from '@type/tool'

import type {
    INtCalcCtx, INtDataType, INtFunc, SymbolChars
} from '.'

const _basicTypeStrs = [ 'String', 'Boolean', 'Number' ] as const
const _genericTypeStrs = [ 'List' ] as const

export type INtDataBasicTypeStr = typeof _basicTypeStrs[number]
export type INtDataGenericTypeStr = typeof _genericTypeStrs[number]
export type INtDataNestedMaxDepth = 2
export type INtDataNestedTypeStr<Depth extends IntSub10 = 0, Inner extends string = INtDataBasicTypeStr> = Depth extends INtDataNestedMaxDepth
    ? never
    : `${INtDataGenericTypeStr}<${Inner}>` | INtDataNestedTypeStr<IncSub10<Depth>, `${INtDataGenericTypeStr}<${Inner}>`>
export type INtDataTypeStr = INtDataBasicTypeStr | INtDataNestedTypeStr

export type IParseNtDataTypeStr<S extends INtDataTypeStr> =
    S extends `${infer Outer}<${infer Inner}>`
        ? Inner extends INtDataTypeStr
            ? { kind: 'nested', outer: Outer, inner: IParseNtDataTypeStr<Inner> }
            : never
        : { kind: 'basic', name: S }

const _isBasicType = (typeStr: INtDataTypeStr): typeStr is INtDataBasicTypeStr => _basicTypeStrs.includes(typeStr as INtDataBasicTypeStr)

const _parseType = (typeStr: INtDataTypeStr): INtDataType => {
    if (_isBasicType(typeStr)) return {
        kind: 'basic',
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
        defs['>='].sigs.push(_newSig([ sigHead, (_, a, b) => cmp(a, b) <= 0 ]))
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
        [ [ 'List<String>', 'Number' ], (_, strs: string[]) => strs.length ]
    ]),

    true: _constFunc('Boolean', true),
    false: _constFunc('Boolean', false),

    ..._compareFuncs([
        [ 'Number', (a: number, b: number) => a - b ],
        [ 'String', (a: string, b: string) => a < b ? - 1 : a > b ? + 1 : 0 ],
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
    'contains': '->',
    'startswith': '->^',
    'endswith': '->$',
    'and': '&',
    'or': '|',
    'not': '!',
    'equals': '==',
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

