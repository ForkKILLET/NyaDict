<script setup lang="ts">
import AuthState from '@comp/AuthState.vue'
import ArchiveList from '@comp/ArchiveList.vue'
</script>

<template>
    <div class="content">
        <AuthState />

        <ArchiveList />
    </div>
</template>

<style scoped>
.content {
    display: flex;
    flex-flow: column;
    height: calc(100vh - 3.5rem);
}

.archive-list {
    flex: 1;
    height: calc(100vh - 3.5rem);
    overflow: hidden;
}
</style>
