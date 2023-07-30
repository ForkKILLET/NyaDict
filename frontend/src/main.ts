import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './routes'
import App from './App.vue'

import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
    faCirclePlus, faArrowCircleLeft, faArrowCircleRight, faCheckCircle,
    faTimesCircle, faArrowLeft, faArrowRight, faArrowUp, faFilter, faPenToSquare,
    faBook, faVial, faSort, faSortUp, faSortDown, faRotate, faCalendar,
    faFolder, faBox, faFileImport, faFileArrowDown, faFileArrowUp,
    faFlag, faFlagCheckered, faUserCircle, faUserPlus, faRightToBracket,
    faRightFromBracket, faLock, faTrash, faTrashRestore, faGift, faSpinner,
    faCloud, faCloudArrowDown, faCloudArrowUp, faInfoCircle, faCircleQuestion,
    faForward, faPlus, faChartLine, faCode, faEye,
} from '@fortawesome/free-solid-svg-icons'

import 'normalize.css'
import '@style/index.css'
import '@style/atom.css'
import '@style/animation.css'
import '@style/word.css'
import '@style/card.css'

library.add(...[
    faCirclePlus, faArrowCircleLeft, faArrowCircleRight, faCheckCircle,
    faTimesCircle, faArrowLeft, faArrowRight, faArrowUp, faFilter, faPenToSquare,
    faBook, faVial, faSort, faSortUp, faSortDown, faRotate, faCalendar,
    faFolder, faBox, faFileArrowDown, faFileArrowUp, faFileImport,
    faFlag, faFlagCheckered, faUserCircle, faUserPlus, faRightToBracket,
    faRightFromBracket, faLock, faTrash, faTrashRestore, faGift, faSpinner,
    faCloud, faCloudArrowUp, faCloudArrowDown, faInfoCircle, faCircleQuestion,
    faForward, faPlus, faChartLine, faCode, faEye,
])

const pinia = createPinia()

createApp(App)
    .component('fa-icon', FontAwesomeIcon)
    .use(pinia)
    .use(router)
    .mount('#app')
