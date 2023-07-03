import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './routes'
import App from './App.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
    faCirclePlus, faArrowCircleRight, faCheckCircle, faTimesCircle,
    faArrowLeft, faArrowRight, faFilter, faPenToSquare,
    faBook, faVial, faSort, faSortUp, faSortDown, faRotate, faCalendar,
    faFolder, faBox, faFileImport, faFileArrowDown, faFileArrowUp,
    faFlag, faFlagCheckered, faUserCircle, faUserPlus, faRightToBracket,
    faRightFromBracket, faLock, faTrash, faTrashRestore, faGift, faSpinner,
    faCloud, faCloudArrowDown, faCloudArrowUp, faInfoCircle, faCircleQuestion,
    faForward, faPlus
} from '@fortawesome/free-solid-svg-icons'

import 'normalize.css'
import './styles/index.css'
import './styles/atom.css'
import './styles/animation.css'
import './styles/word.css'

library.add(...[
    faCirclePlus, faArrowCircleRight, faCheckCircle, faTimesCircle,
    faArrowLeft, faArrowRight, faFilter, faPenToSquare,
    faBook, faVial, faSort, faSortUp, faSortDown, faRotate, faCalendar,
    faFolder, faBox, faFileArrowDown, faFileArrowUp, faFileImport,
    faFlag, faFlagCheckered, faUserCircle, faUserPlus, faRightToBracket,
    faRightFromBracket, faLock, faTrash, faTrashRestore, faGift, faSpinner,
    faCloud, faCloudArrowUp, faCloudArrowDown, faInfoCircle, faCircleQuestion,
    faForward, faPlus
])

const pinia = createPinia()

createApp(App)
    .component('fa-icon', FontAwesomeIcon)
    .use(pinia)
    .use(router)
    .mount('#app')
