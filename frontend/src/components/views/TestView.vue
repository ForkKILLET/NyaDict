<script setup lang="ts">
import TestList from '@comp/TestList.vue'
</script>

<template>
    <div class="content">
        <TestList />
    </div>
</template>
    
<style scoped>
.content {
    display: flex;
    flex-flow: column;
    height: 100%;
    text-align: center;
    align-items: center;
}

.test-list {
    width: 80vw;
    min-width: 20em;
}
</style>
