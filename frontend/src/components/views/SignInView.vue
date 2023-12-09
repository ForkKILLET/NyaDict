<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@store/auth'
import type { ISignInResp } from '@type/network'
import { handleResp } from '@util/notif'
import ActionPanel from '@comp/ActionPanel.vue'

const authStore = useAuth()
const { api } = authStore
const router = useRouter()

const username = ref(authStore.recentlySignedUpUsername ?? '')
const password = ref('')

const pending = ref(false)
const submit = async () => {
    pending.value = true
    const resp = await handleResp({
        name: 'ログイン',
        action: async () => await api.post('/auth/sign-in', {
            name: username.value,
            password: password.value
        }) as ISignInResp
    })
    pending.value = false
    if (! resp) return

    const { token } = resp
    authStore.jwt = token
    router.push('/sync')
}
</script>

<template>
    <ActionPanel
        title="ログイン"
        :submit="submit"
        :pending="pending"
    >
        <div class="item">
            <fa-icon
                icon="user-circle"
                :fixed-width="true"
            />
            <input
                v-model="username"
                type="text"
                placeholder="ユーザー名"
                class="card light"
            >
        </div>
        <div class="item">
            <fa-icon
                icon="lock"
                :fixed-width="true"
            />
            <input
                v-model="password"
                type="password"
                placeholder="パスワード"
                class="card light"
            >
        </div>
    </ActionPanel>
</template>
