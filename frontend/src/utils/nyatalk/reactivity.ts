import { ref, watch, type Ref } from 'vue'

import { parse, compile, type INtParseResult, type NtError } from '@util/nyatalk'

import { IWord } from '@type'

export const useNyatalk = (input: {
    code: Ref<string>
    advanced: Ref<boolean>
    isBoolean: Ref<boolean>
}, output: {
    ntParseResult?: Ref<INtParseResult | null>
    ntError?: Ref<NtError | null>
    ntFunction?: Ref<((word: IWord) => boolean) | null>
}) => {
    const { code, advanced, isBoolean } = input
    const ntParseResult = output.ntParseResult ?? ref(null)
    const ntError = output.ntError ?? ref(null)
    const ntFunction = output.ntFunction ?? ref(null)

    watch([ code, advanced ], () => {
        const result = ntParseResult.value = parse(code.value, {
            advanced: advanced.value,
            isBoolean: isBoolean.value
        })
        switch (result.state) {
            case 'null':
                ntError.value = null
                ntFunction.value = null
                break
            case 'error':
                ntError.value = result.error
                ntFunction.value = null
                break
            case 'success':
                ntError.value = null
                ntFunction.value = compile(result.ast, code.value)
                break
        }
    }, { immediate: true })

    return {
        ntParseResult,
        ntError,
        ntFunction
    }
}
