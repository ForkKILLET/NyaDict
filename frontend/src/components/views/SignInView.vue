<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth'
import { ISignInResp } from '../../types/network'
import { api } from '../../utils/api'
import ActionPanel from '../ActionPanel.vue'

const authStore = useAuth()
const router = useRouter()

const username = ref(authStore.recentlySignedUpUsername ?? '')
const password = ref('')

const state = ref<'idle' | 'pending'>('idle')
const error = ref<string | null>(null)
const submit = async () => {
    state.value = 'pending'
    error.value = null
    const resp = await api.post('/auth/sign-in', {
        name: username.value,
        password: password.value
    }) as ISignInResp

    state.value = 'idle'
    if (! resp) {
        error.value = 'ネットワーク・エラー'
        return
    }
    if (resp.statusCode === 401) {
        error.value = resp.message
    }
    else {
        error.value = null
        const { token } = resp
        authStore.jwt = token
        router.push('/sync')
    }
}
</script>

<template>
    <ActionPanel
        title="ログイン"
        :submit="submit"
        :submit-state="state"
        :error="error"
    >
        <div class="item">
            <fa-icon icon="user-circle" :fixed-width="true" />
            <input
                v-model="username"
                type="text"
                placeholder="ユーザー名"
                class="card up"
            />
        </div>
        <div class="item">
            <fa-icon icon="lock" :fixed-width="true" />
            <input
                v-model="password"
                type="password"
                placeholder="パスワード"
                class="card up"
            />
        </div>
    </ActionPanel>
</template>
