import { defineStore } from 'pinia'
import { ref, type Component, shallowRef } from 'vue'

export const useModal = defineStore('modal', () => {
    const component = shallowRef<Component>()
    const ownerToken = ref<Symbol>()

    const open = (comp: Component) => {
        if (component.value) return null
        const token = Symbol('ModalOwner')
        component.value = comp
        ownerToken.value = token
        return {
            token,
            close: () => {
                if (ownerToken.value === token) {
                    component.value = undefined
                    ownerToken.value = undefined
                    return true
                }
                return false
            }
        }
    }

    const forceClose = () => {
        component.value = undefined
    }

    return {
        component,
        open, forceClose
    }
})
