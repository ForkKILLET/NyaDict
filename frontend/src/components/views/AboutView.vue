<script setup lang="ts">
import NyaDate from '@comp/NyaDate.vue'
import NyaTitle from '@comp/NyaTitle.vue'

const buildTime = + new Date(import.meta.env.VITE_BUILD_TIME || new Date)
const buildEnv = import.meta.env.VITE_BUILD_ENV || 'NyaOS'
const lastCommit = import.meta.env.VITE_LAST_COMMIT
const [ lastCommitHash, lastCommitMsg ] = lastCommit.split(/(?<! .*) /)
const repoName = import.meta.env.VITE_REPO_NAME || 'ForkKILLET/NyaDict'
</script>

<template>
    <div class="card content">
        <NyaTitle />

        Build at <NyaDate :date="buildTime" /> on <span class="order">{{ buildEnv }}</span>
        by <a
            href="https://github.com/ForkKILLET"
            target="_blank"
        >ForkKILLET</a> with <span class="love">&lt;3</span>
        
        <div class="last-commit barber">
            <a
                :href="`https://github.com/${repoName}/commit/${lastCommitHash}`"
                target="_blank"
            >
                <span class="order">#{{ lastCommitHash }}</span>
            </a> {{ lastCommitMsg }}
        </div>
    </div>
</template>

<style scoped>
.content {
    margin: 0 auto;
    width: 60vw;
    min-width: 15em;
    text-align: center;
}

.nya-title {
    font-size: 2em;
}

.last-commit {
    margin-top: 2em;
    padding: .5em;
    border-radius: .8em;
}

.love {
    color: pink;
}
</style>
