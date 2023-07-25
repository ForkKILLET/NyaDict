<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
</script>

<template>
    <div class="back-to-home">
        <a href="javascript:void 0;" @click="router.back()">
            <fa-icon icon="arrow-left" /> 戻る
        </a> /
        <RouterLink :to="route.path.replace(/\/.*?$/, '/')">
            <fa-icon icon="arrow-up" /> アップ
        </RouterLink>
    </div>
</template>

<style scoped>
.back-to-home {
    height: 1.5rem;
    padding: 1rem;
}
</style>
