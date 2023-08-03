<script setup lang="ts">
import { ref } from 'vue'
import { type IWord, DocumentKind, IWordDocumentWithoutId } from '@type'

defineProps<{
    word: IWord
}>()

const emit = defineEmits<{
    (event: 'add-doc', newDoc: IWordDocumentWithoutId): void
}>()

const documentKindInfo: Record<DocumentKind, string> = {
    [DocumentKind.Meaning]: '解釈',
    [DocumentKind.Sentence]: '例'
}

const showKinds = ref(false)

const addDoc = (kind: DocumentKind) => {
    showKinds.value = false

    let newDoc: IWordDocumentWithoutId
    switch (kind) {
        case DocumentKind.Meaning:
            newDoc = {
                kind,
                text: '',
                docs: []
            }
            break
        case DocumentKind.Sentence:
            newDoc = {
                kind,
                text: '',
                tran: ''
            }
            break
    }

    emit('add-doc', newDoc)
}
</script>

<template>
    <div class="doc-adder">
        <div class="doc-adder-toolbar">
            <fa-icon
                @click="showKinds = ! showKinds"
                icon="circle-plus" class="button"
            />

            <div class="doc-kinds" v-show="showKinds">
                <div
                    v-for="info, kind in documentKindInfo"
                    @click="addDoc(+ kind)"
                    class="doc-kind-info badge"
                >{{ info }}</div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.doc-adder-toolbar {
    position: relative;
    margin-bottom: 1em;
    height: 1.5em;
}

.doc-kinds {
    display: inline-block;
    margin-left: .5em;
}

input {
    display: inline;
}

.doc-adder-toolbar > svg.button {
    padding-left: 0;
}
</style>
