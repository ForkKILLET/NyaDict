/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_SYNC_API: string
    readonly VITE_LAST_COMMIT: string
    readonly VITE_BUILD_TIME: string
    readonly VITE_BUILD_ENV: string
    readonly VITE_REPO_NAME: string
}
