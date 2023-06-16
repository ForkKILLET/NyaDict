<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../stores/auth'
import { ISignUpResp } from '../../types/network'
import { api } from '../../utils/api'
import ActionPanel from '../ActionPanel.vue'

const authStore = useAuth()
const router = useRouter()

const username = ref('')
const password = ref('')
const invitationCode = ref('')

const state = ref<'idle' | 'pending'>('idle')
const error = ref<string | null>(null)
const submit = async () => {
    state.value = 'pending'
    error.value = null
    const resp = await api.post('/auth/sign-up', {
        name: username.value,
        password: password.value,
        invitationCode: invitationCode.value
    }) as ISignUpResp

    state.value = 'idle'
    if (! resp) {
        error.value = 'ネットワーク・エラー'
        return
    }
    if (resp.statusCode !== 200) {
        error.value = resp.message
    }
    else {
        authStore.recentlySignedUpUsername = resp.name
        error.value = null
        router.push('/sync/sign-in')
    }
}
</script>

<template>
    <ActionPanel
        title="登録"
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
        <div class="item">
            <fa-icon icon="gift" :fixed-width="true" />
            <input
                v-model="invitationCode"
                type="text"
                placeholder="招待コード"
                class="card up"
            />
        </div>
    </ActionPanel>
</template>
