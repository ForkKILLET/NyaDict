<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuth } from '../stores/auth'
import Card from './Card.vue'

const authStore = useAuth()
const { jwtPayload } = storeToRefs(authStore)
</script>

<template>
    <Card class="auth-state">
        <template v-if="jwtPayload">
            <fa-icon icon="user-circle" />
            <span class="username">{{ jwtPayload.name }}</span> さん
        </template>
        <template v-else>
            <RouterLink to="/sync/login">
                <fa-icon icon="right-to-bracket" />
                登録
            </RouterLink>
        </template>
    </Card>
</template>

<style scoped>
.auth-state > svg {
    margin-right: .5em;
}

.username {
    color: #db8e30;
}
</style>
