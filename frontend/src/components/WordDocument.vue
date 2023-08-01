<script setup lang="ts">
import { computed } from 'vue'
import { type IWordDocumentWithoutId, DocumentKind } from '@type'
import NyaConfirmInput from '@comp/NyaConfirmInput.vue'

const props = defineProps<{
    doc: IWordDocumentWithoutId
    editMode?: boolean
}>()

const lang = computed(() => props.doc.lang ?? navigator.language)
</script>

<template>
    <div v-if="doc.kind === DocumentKind.Meaning" class="meaning-doc">
        <div class="meaning-doc-text card" :lang="lang">
            <NyaConfirmInput
                v-model="doc.text"
                :edit-mode="editMode"
                :autofocus="true"
            />
        </div>

        <WordDocument v-for="child of doc.children" :doc="child" />
    </div>
    <div v-else-if="doc.kind === DocumentKind.Sentence" class="setence-doc">
        
    </div>
</template>

<style scoped>
.meaning-doc {
    margin-bottom: 1em;
}
</style>
