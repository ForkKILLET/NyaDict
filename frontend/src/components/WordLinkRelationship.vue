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
        :class="{ editing: editMode }"
        @click="showRels = true"
    >
        <div class="link-doc-rel outter">
            {{ relInfo[rel] }}
        </div>
        <Transition name="fade">
            <div
                v-if="showRels && editMode"
                v-on-click-outside="event => { event.stopPropagation(); showRels = false }"
                class="link-doc-rels"
            >
                <div
                    v-for="info, rel in relInfo"
                    class="link-doc-rel"
                    @click.stop="emit('update:rel', + rel); showRels = false"
                >
                    {{ info }}
                </div>
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
    user-select: none;
    color: var(--color-ui);
    background-color: var(--color-ui-bg-alt);
}

.link-doc-rel.outter {
    margin-right: .8em;
}

.editing .link-doc-rel {
    cursor: pointer;
    animation: .3s hop;
}

.link-doc-rels > .link-doc-rel {
    margin-right: .2em;
}

.link-doc-rels {
    position: absolute;
    z-index: 2;
    margin-left: -.2em;
    padding: .2em;
}
</style>
