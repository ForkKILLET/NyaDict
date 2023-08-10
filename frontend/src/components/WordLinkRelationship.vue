<script setup lang="ts">
import { LinkDocumentRelationship } from '@type'

defineProps<{
    rel: LinkDocumentRelationship
}>()

const relationshipInfo: Record<LinkDocumentRelationship, string> = {
    [LinkDocumentRelationship.OppositeMeaning]: '反',
    [LinkDocumentRelationship.SimilarMeaning]: '類',
    [LinkDocumentRelationship.SimilarPronunciation]: '音',
    [LinkDocumentRelationship.SimilarSpelling]: '書',
    [LinkDocumentRelationship.Other]: '・'
}
</script>

<template>
    <div class="link-doc-rel">{{ relationshipInfo[rel] }}</div>
</template>

<style scoped>
.link-doc-rel {
    display: inline-block;
    width: 1em;
    height: 1em;
    margin-right: .5em;
    padding: .1em;
    border-radius: .2em;
    line-height: 1;
    text-align: center;
    background-color: #db8e30;
    color: #fff;
}
</style>
