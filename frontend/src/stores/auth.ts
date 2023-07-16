import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import jwtDecode from 'jwt-decode'
import { storeRef } from '@util/storage'
import type { IAuthPayload } from '@type/network'

export const useAuth = defineStore('auth', () => {
    const jwt = storeRef<string | null>('jwt', null)
    const jwtPayload = computed<IAuthPayload | null>(() => {
        const token = jwt.value
        if (! token) return null

        return jwtDecode<IAuthPayload>(token)
    })

    const recentlySignedUpUsername = ref<string | null>(null)

    const axiosHeader = computed(() => {
        if (jwt.value) return {
            Authorization: `Bearer ${jwt.value}`
        }
    })

    return {
        jwt, jwtPayload, recentlySignedUpUsername, axiosHeader
    }
})
