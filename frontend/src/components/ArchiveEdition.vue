<script setup lang="ts">
import NyaDate from '@comp/NyaDate.vue'

import type { IArchiveEdition } from '@type'

defineProps<{
    edition: IArchiveEdition
}>()
</script>

<template>
    <span class="archive-edition">
        <NyaDate
            :date="edition.time"
            format="MM-DD hh:mm"
        />
        @ <span class="archive-device">{{ edition.device }}</span>
        <slot />
    </span>
</template>

<style scoped>
.archive-edition.active {
    text-decoration: underline;
}

.archive-device {
    color: var(--color-ui);
}
</style>
