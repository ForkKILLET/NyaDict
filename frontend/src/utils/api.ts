import axios, { AxiosError } from 'axios'

export const api = axios.create({
    baseURL: import.meta.env.VITE_SYNC_API
})

api.interceptors.response.use(
    resp => ({
        statusCode: 200,
        ...resp.data
    }),
    (error: Error | AxiosError) => {
        if (error instanceof AxiosError) {
            if (error.response?.status === 401) {
                return error.response.data
            }
        }
    }
)
