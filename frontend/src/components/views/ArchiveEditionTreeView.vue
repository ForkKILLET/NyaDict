<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import { useArchive } from '@store/archive'

import NyaDate from '@comp/NyaDate.vue'

const route = useRoute()
const archiveStore = useArchive()

const archiveId = computed(() => {
    const { id } = route.params
    if (typeof id === 'string') return id
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
</script>

<template>
    <div class="card">
        <span class="id">{{ archiveId }}</span>
        <div v-if="archiveInfo?.editionChain">
            <div v-for="edition of archiveInfo.editionChain">
                <NyaDate :date="edition.time" format="MM-DD hh:mm" />
                @ <span class="archive-device">{{ edition.device }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.archive-device {
    color: var(--color-ui);
}
</style>
