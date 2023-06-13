<script setup lang="ts">
import { AxiosError } from 'axios'
import { ref } from 'vue'
import { useAuth } from '../../stores/auth';
import { ISignInResp } from '../../types/network';
import { api } from '../../utils/api'
import Card from '../Card.vue'

const username = ref('')
const password = ref('')

const authStore = useAuth()
const submit = async () => {
    const resp = await api
        .post<ISignInResp>('/auth/sign-in', {
            name: username.value,
            password: password.value
        })
        .catch((err: AxiosError | Error) => {
            if (err instanceof AxiosError) {
                const status = err.response?.status
                console.log(status)
            }
        })

    if (! resp) return
    const { token } = resp.data
    authStore.jwt = token
}
</script>

<template>
    <Card class="panel">
        <h2>登録</h2>
        <div class="item">
            <fa-icon icon="user-circle" :fixed-width="true" />
            <input v-model="username" type="text" class="card up" />
        </div>
        <div class="item">
            <fa-icon icon="lock" :fixed-width="true" />
            <input v-model="password" type="password" class="card up" />
        </div>
        <div>
            <Card @click="submit" class="inline button up">
                <fa-icon icon="arrow-right" class="button" />
            </Card>
        </div>
    </Card>
</template>

<style scoped>
.panel {
    width: 40%;
    min-width: 200px;
    max-width: 400px;
    margin: 0 auto;
    padding: 2em;
    text-align: center;
}

h2 {
    margin: 0;
}

.panel > div {
    margin-top: .8em;
}

.item {
    display: flex;
    align-items: center;
}

.item > svg:first-child {
    margin-right: .5em;
}

input {
    flex: 1;
}
</style>
