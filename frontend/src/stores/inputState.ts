import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useInputState = defineStore('input-store', () => {
    const lastEditedInputId = ref<number | null>(null)
    const maxInputId = ref(0)

    return { lastEditedInputId, maxInputId }
})
