<script setup lang="ts">
import AuthState from '../AuthState.vue'
import ArchiveList from '../ArchiveList.vue'
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
}
</style>
