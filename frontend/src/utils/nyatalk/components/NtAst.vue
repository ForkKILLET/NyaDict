<script setup lang="ts">
import { ref } from 'vue'

import { printType, printFuncName, escapeStr, type INtAst } from '..'
import NtAstProp from './NtAstProp.vue'

defineProps<{
    ast: INtAst
}>()

const folded = ref(false)
</script>

<template>
    <div>
        <div @click="folded = ! folded" class="ast-type">
            <fa-icon
                :icon="folded ? 'plus' : 'minus'"
            /> {{ ast.type.toUpperCase() }}
        </div>
        <div v-show="! folded" class="ast-indent">
            <template v-if="ast.type === 'call'">
                <NtAstProp prop="FuncName">
                    <span class="ast-symbol">{{ printFuncName(ast.funcName) }}</span>
                </NtAstProp>
                <NtAstProp prop="Args">
                    <div class="ast-indent">
                        <NtAst v-for="arg of ast.args" :ast="arg" />
                    </div>
                </NtAstProp>
                <NtAstProp prop="Signature">
                    <span class="ast-signature">
                        <template v-for="t, index of ast.sig.types">
                            {{ index ? ' => ' : '' }}
                            <span class="ast-symbol">{{ printType(t) }}</span>
                        </template>
                    </span>
                </NtAstProp>
            </template>
            <template v-else-if="ast.type === 'number'">
                <NtAstProp prop="Value">
                    <span class="ast-number">{{ ast.value }}</span>
                </NtAstProp>
            </template>
            <template v-else-if="ast.type === 'string'">
                <NtAstProp prop="Value">
                    <span class="ast-string">{{ escapeStr(ast.value) }}</span>
                </NtAstProp>
            </template>
        </div>
    </div>
</template>

<style scoped>
.ast-type {
    user-select: none;
    font-weight: bold;
}

.ast-indent {
    padding-left: 1.5em;
}

.ast-number {
    color: var(--color-num);
}

.ast-string {
    color: var(--color-ui);
}

.ast-signature {
    font-family: var(--font-mono);
}

.ast-symbol {
    color: var(--color-order);
    font-family: var(--font-mono);
}
</style>
