import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

declare module '@vue/runtime-core' {
    export interface GlobalComponents {
        FaIcon: typeof FontAwesomeIcon
    }
}