import { ref, watch, type Ref } from 'vue'
import { MaybeRef, toValue } from '@vueuse/core'

import { parse, compile, type INtParseResult, type NtError, INtFunction } from '@util/nyatalk'

export const useNyatalk = <Ctx, DataIn, DataOut>(input: {
    code: MaybeRef<string>
    advanced: MaybeRef<boolean>
    isBoolean: MaybeRef<boolean>
    getCalcCtx: MaybeRef<(inner: DataIn) => Ctx>
}, output: {
    ntParseResult?: Ref<INtParseResult | null>
    ntError?: Ref<NtError | null>
    ntFunction?: Ref<INtFunction<DataIn, DataOut> | null>
}) => {
    const { code, advanced, isBoolean, getCalcCtx } = input
    const ntParseResult = output.ntParseResult ?? ref(null)
    const ntError = output.ntError ?? ref(null)
    const ntFunction = output.ntFunction ?? ref(null)

    watch([ code, advanced ], () => {
        const result = ntParseResult.value = parse(toValue(code), {
            advanced: toValue(advanced),
            isBoolean: toValue(isBoolean)
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
                ntFunction.value = compile<Ctx, DataIn, DataOut>(
                    result.ast,
                    toValue(code),
                    toValue(getCalcCtx)
                )
                break
        }
    }, { immediate: true })

    return {
        ntParseResult,
        ntError,
        ntFunction
    }
}
