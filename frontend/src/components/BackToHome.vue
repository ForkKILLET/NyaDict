<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
    <div class="back-to-home">
        <a href="javascript:void 0;" @click="router.back">
            <fa-icon icon="arrow-left" /> 戻る
        </a>
    </div>
</template>

<style scoped>
.back-to-home {
    height: 1.5rem;
    padding: 1rem;
}
</style>
