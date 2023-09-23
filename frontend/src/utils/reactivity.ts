import { ref, watch, type Ref } from 'vue'

export const depRef = <T, D extends object>(calc: () => T, dep: D): Ref<T> => {
    const r = ref(calc()) as Ref<T>
    watch(dep, () => {
        r.value = calc()
    })

    return r
}
