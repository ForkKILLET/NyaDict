import { defineStore } from 'pinia'
import { computed } from 'vue'
import jwtDecode from 'jwt-decode'
import { storageRef } from '../utils/storage'
import type { IAuthPayload } from '../types/network'

export const useAuth = defineStore('auth', () => {
    const jwt = storageRef<string | null>('jwt', null)
    const jwtPayload = computed<IAuthPayload | null>(() => {
        const token = jwt.value
        if (! token) return null

        return jwtDecode<IAuthPayload>(token)
    })

    return {
        jwt, jwtPayload
    }
})
