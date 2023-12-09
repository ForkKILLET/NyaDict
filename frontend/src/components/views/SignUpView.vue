<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import { useAuth } from '@store/auth'

import { handleResp } from '@util/notif'
import type { ISignUpResp } from '@type/network'

import ActionPanel from '@comp/ActionPanel.vue'

const authStore = useAuth()
const { api } = authStore
const router = useRouter()

const username = ref('')
const password = ref('')
const invitationCode = ref('')

const pending = ref(false)
const submit = async () => {
    pending.value = true
    const resp = await handleResp({
        name: '登録',
        action: async () => await api.post('/auth/sign-up', {
            name: username.value,
            password: password.value,
            invitationCode: invitationCode.value
        }) as ISignUpResp
    })
    pending.value = false
    if (! resp) return

    authStore.recentlySignedUpUsername = resp.name
    router.push('/sync/sign-in')
}
</script>

<template>
    <ActionPanel
        title="登録"
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
        <div class="item">
            <fa-icon
                icon="gift"
                :fixed-width="true"
            />
            <input
                v-model="invitationCode"
                type="text"
                placeholder="招待コード"
                class="card light"
            >
        </div>
    </ActionPanel>
</template>
