<script setup lang="ts">
import { ref } from 'vue'
import { vOnClickOutside } from '@vueuse/components'
import { LinkDocumentRelationship } from '@type'

defineProps<{
    rel: LinkDocumentRelationship
    editMode?: boolean
}>()

const emit = defineEmits<{
    (event: 'update:rel', rel: LinkDocumentRelationship): void
}>()

const relInfo: Record<LinkDocumentRelationship, string> = {
    [LinkDocumentRelationship.OppositeMeaning]: '反',
    [LinkDocumentRelationship.SimilarMeaning]: '類',
    [LinkDocumentRelationship.SimilarPronunciation]: '音',
    [LinkDocumentRelationship.SimilarSpelling]: '書',
    [LinkDocumentRelationship.Other]: '・'
}

const showRels = ref(false)
</script>

<template>
    <div
        @click="showRels = true"
    >
        <div class="link-doc-rel outter" :class="{ editing: editMode }">{{ relInfo[rel] }}</div>
        <Transition name="fade">
            <div
                v-if="showRels && editMode"
                v-on-click-outside="event => { event.stopPropagation(); showRels = false }"
                class="link-doc-rels"
            >
                <div
                    v-for="info, rel in relInfo"
                    class="link-doc-rel"
                    @click="emit('update:rel', + rel)"
                >{{ info }}</div>
            </div>
        </Transition>
    </div>
</template>

<style scoped>
.link-doc-rel {
    display: inline-block;
    width: 1.1em;
    height: 1.1em;
    padding: .1em;

    border-radius: .2em;
    line-height: 1;
    text-align: center;
    color: #db8e30;
    background-color: #f3e4d8;
}

.link-doc-rel.outter {
    margin-right: .8em;
}

.link-doc-rel.outter.editing {
    cursor: pointer;
    animation: .3s hop;
}

.link-doc-rels > .link-doc-rel {
    margin-right: .2em;
}

.link-doc-rels {
    position: absolute;
    margin-left: -.2em;
    padding: .2em;
    background-color: #fff;
    border-radius: .3em;
}
</style>
