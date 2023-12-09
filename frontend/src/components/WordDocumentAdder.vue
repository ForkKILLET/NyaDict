<script setup lang="ts">
import { ref } from 'vue'
import { vOnClickOutside } from '@vueuse/components'
import {
    DocumentKind, LinkDocumentRelationship,
    type IWordDocumentWithoutId
} from '@type'

const emit = defineEmits<{
    (event: 'add-doc', newDoc: IWordDocumentWithoutId): void
}>()

const documentKindInfo: Record<DocumentKind, string> = {
    [DocumentKind.Meaning]: '解釈',
    [DocumentKind.Sentence]: '例',
    [DocumentKind.Link]: 'リンク'
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
        case DocumentKind.Link:
            newDoc = {
                kind,
                text: '',
                rel: LinkDocumentRelationship.Other
            }
            break
    }

    emit('add-doc', newDoc)
}
</script>

<template>
    <span class="doc-adder">
        <fa-icon
            icon="circle-plus"
            class="button"
            @click="showKinds = ! showKinds"
        />

        <Transition name="fade">
            <div
                v-if="showKinds"
                v-on-click-outside="() => { showKinds = false }"
                class="doc-kinds"
            >
                <div
                    v-for="info, kind in documentKindInfo"
                    class="doc-kind-info badge"
                    @click="addDoc(+ kind)"
                >{{ info }}</div>
            </div>
        </Transition>
    </span>
</template>

<style scoped>
.doc-adder {
    position: relative;
    margin-bottom: 1em;
    height: 1.5em;
}

.doc-kinds {
    position: absolute;
    left: -.5em;
    z-index: 1;

    background-color: var(--color-bg);
    border-radius: .3em;
}

.doc-kind-info {
    display: block;
}

input {
    display: inline;
}

.doc-adder > svg.button {
    padding-left: 0;
}
</style>
