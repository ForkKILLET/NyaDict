import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [ vue() ],
    base: './',
    resolve: {
        alias: {
            '@': '/src/',
            '@comp': '/src/components/',
            '@type': '/src/types/',
            '@store': '/src/stores/',
            '@util': '/src/utils/',
            '@style': '/src/styles/'
        }
    }
})
