<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAuth } from '@store/auth'
import { add as addNoti } from '../utils/notif';

const authStore = useAuth()
const { jwtPayload } = storeToRefs(authStore)

const signOut = () => {
    authStore.jwt = null
    addNoti({
        content: 'ログアウトしました',
        type: 'success',
        duration: 2 * 1000
    })
}
</script>

<template>
    <div class="auth-state card">
        <template v-if="jwtPayload">
            <fa-icon icon="user-circle" />
            <span class="username">{{ jwtPayload.name }}</span> さん &middot;
            <fa-icon
                @click="signOut"
                icon="right-from-bracket"
                class="button"
            />
        </template>
        <template v-else>
            <RouterLink to="/sync/sign-in">
                <fa-icon icon="right-to-bracket" />
                ログイン
            </RouterLink> &middot;
            <RouterLink to="/sync/sign-up">
                <fa-icon icon="user-plus" />
                登録
            </RouterLink>
        </template>
    </div>
</template>

<style scoped>
.auth-state > svg {
    margin-right: .5em;
}

.username {
    color: #db8e30;
}
</style>
../utils/notif
