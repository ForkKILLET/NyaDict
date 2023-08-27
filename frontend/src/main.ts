import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { router } from './routes'
import App from './App.vue'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import '@util/fa-load'

import 'normalize.css'
import '@style/index.css'
import '@style/color.css'
import '@style/atom.css'
import '@style/transition.css'
import '@style/animation.css'
import '@style/word.css'
import '@style/card.css'

const pinia = createPinia()

createApp(App)
    .component('fa-icon', FontAwesomeIcon)
    .use(pinia)
    .use(router)
    .mount('#app')
