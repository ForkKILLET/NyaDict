import { defineStore, storeToRefs } from 'pinia'
import { computed, ref, shallowRef } from 'vue'
import axios, { AxiosError, type AxiosInstance, type AxiosRequestConfig } from 'axios'
import jwtDecode from 'jwt-decode'

import { useConfig } from '@store/config'

import { storeRef } from '@util/storage'

import type { IAuthPayload } from '@type/network'

export const useAuth = defineStore('auth', () => {
    const { config } = storeToRefs(useConfig())

    const jwt = storeRef<string | null>('jwt', null)
    const jwtPayload = computed<IAuthPayload | null>(() => {
        const token = jwt.value
        if (! token) return null

        return jwtDecode<IAuthPayload>(token)
    })

    const recentlySignedUpUsername = ref<string | null>(null)

    const axiosMethods = [ 'get', 'post' ] as const
    const isAxiosMethod = (k: keyof any): k is typeof axiosMethods[number] => {
        if (typeof k === 'string') return axiosMethods.includes(k as any)
        return false
    }

    const api = new Proxy(axios.create(), {
        get: (instance, k) => {
            if (isAxiosMethod(k)) {
                const baseConfig: AxiosRequestConfig = {
                    baseURL: config.value.syncApi,
                    headers: {
                        Authorization: `Bearer ${jwt.value}`
                    }
                }
                return (...args: [string, any, any]) => {
                    if (k === 'get') args[1] = { ...baseConfig, ...args[1] }
                    else args[2] = { ...baseConfig, ...args[2] }
                    return instance[k](...args)
                }
            }
            return instance[k as keyof AxiosInstance]
        }
    })

    api.interceptors.response.use(
        resp => Object.assign(resp.data, { statusCode: 200 }),
        (error: Error | AxiosError) => {
            if (error instanceof AxiosError) {
                if (error.response?.status === 401) {
                    return error.response.data
                }
            }
        }
    )

    return {
        jwt, jwtPayload, recentlySignedUpUsername, api: shallowRef(api)
    }
})
