<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

import { useArchive } from '@store/archive'

import ArchiveEdition from '@comp/ArchiveEdition.vue'

const route = useRoute()
const archiveStore = useArchive()

const archiveId = computed(() => {
    const { id } = route.query
    if (id && typeof id === 'string') return id
    return undefined
})

const isRemote = computed(() =>
    'remote' in route.query
)

const archiveInfo = computed(() => {
    const id = archiveId.value
    if (! id) return
    if (isRemote.value) return archiveStore.remoteArchivesInfo?.[id]
    return archiveStore.localArchivesInfo[id]
})

onMounted(() => {
    archiveStore.fetchRemoteArchivesInfo()
})
</script>

<template>
    <div class="card">
        <span class="id">{{ archiveId }}</span>
        <div v-if="archiveInfo?.editionChain">
            <div
                v-for="edition, index of [ ...archiveInfo.editionChain ].reverse()"
            >
                <ArchiveEdition :edition="edition">
                    <span
                        v-if="index === 0"
                        class="edition-pointer"
                    >
                        <fa-icon icon="arrow-left" />
                        {{ isRemote ? 'リモート' : 'ローカル' }}
                    </span>
                </ArchiveEdition>
            </div>
        </div>
    </div>
</template>

<style scoped>
.edition-pointer {
    margin-left: .5em;
    color: var(--color-order);
}
</style>
