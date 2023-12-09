<script setup lang="ts">
import { version } from '@/../package.json'
</script>

<template>
    <h1 class="nya-title">
        Nya Dict
        <RouterLink
            to="/about"
            class="version no-color-change"
        >
            <span>{{ version }}</span>
        </RouterLink>
    </h1>
</template>

<style scoped>
h1 {
    position: relative;
}

.version {
    position: absolute;
    top: 0;
    margin-left: .5em;
    padding: .2em;
    border-radius: .3rem;
    font-size: .8rem;
    font-weight: normal;
    color: var(--color-bg);
    background-color: var(--color-order);
}
</style>
