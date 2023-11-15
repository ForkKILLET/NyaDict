<script setup lang="ts">
import { ref } from 'vue'

import { storeRef } from '@util/storage'
import { useNyatalk } from '@util/nyatalk/reactivity'
import NtParseError from '@util/nyatalk/components/NtParseError.vue';
import NtAst from '@util/nyatalk/components/NtAst.vue';
import NyaTab from '@comp/NyaTab.vue';
import { stringify } from '@util/nyatalk';

const code = storeRef('nyatalkCode', '')

const {
    ntParseResult,
    ntError,
} = useNyatalk<{}, any, any>({
    code,
    advanced: true,
    isBoolean: false,
    getCalcCtx: ref(() => ({}))
}, {})
</script>

<template>
    <div class="content">
        <div class="left card">
            NyaTalk

            <div class="editor">
                <textarea v-model="code"></textarea>
            </div>
        </div>

        <div class="right card scroll-y">
            <template v-if="! ntParseResult || ntParseResult.state === 'null'">
                /
            </template>
            <template v-else-if="ntParseResult.state === 'error' && ntError">
                <NtParseError :error="ntError" />
            </template>
            <template v-else-if="ntParseResult.state === 'success'">
                <NyaTab :tabs="[
                    { name: 'ast', title: 'AST' },
                    { name: 'stringify', title: '逆解析' }
                ]">
                    <template #ast>
                        <NtAst :ast="ntParseResult.ast" />
                    </template>
                    <template #stringify>
                        <span class="nt-code">{{ stringify(ntParseResult.ast) }}</span>
                    </template>
                </NyaTab>
            </template>
        </div>
    </div>
</template>

<style scoped>
.content {
    display: flex;
    height: calc(100% - 1.5em);
    margin: 0.5em 1em 1em 1em;
}

.left {
    flex-basis: 50%;
    min-width: 20em;

    display: flex;
    flex-flow: column;
    box-sizing: border-box;
    margin-right: 0.75em;
}
.right {
    flex: 1;

    box-sizing: border-box;
    margin-left: 0.75em;
}

.editor {
    margin-top: 1em;
}

.editor > textarea {
    resize: vertical;
    width: calc(100% - 1em);
    min-height: 4em;
    padding: .5em;
    font-size: 1rem;
    font-family: var(--font-mono);
}

.nt-code {
    font-family: var(--font-mono);
}
</style>
