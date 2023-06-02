<script setup lang="ts">
import { version } from '../../../package.json'
</script>

<template>
    <div class="home">
        <h1>
            Nya Dict
            <span class="version">{{ version }}</span>
        </h1>
        <p>
            <RouterLink to="/words">単語</RouterLink> |
            <RouterLink to="/test">テスト</RouterLink>
        </p>
    </div>
</template>

<style scoped>
.home {
    text-align: center;
    margin-top: 35vh;
}

h1 {
    position: relative;
}

.version {
    position: absolute;
    top: 0;
    padding: .2em;
    border-radius: .3rem;
    font-size: .8rem;
    font-weight: normal;
    color: #fff;
    background-color: #5a21f7;
}
</style>
