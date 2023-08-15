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
    box-sizing: border-box;
}

.archive-list {
    flex: 1;
    box-sizing: border-box;
    overflow: hidden;
}
</style>
