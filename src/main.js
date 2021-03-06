import Vue from 'vue'
import App from './App.vue'
import router from './router'

Vue.config.productionTip = false

// Font Awesome Icon
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

library.add(fas)
library.add(fab)

Vue.component('fa', FontAwesomeIcon)

import * as VueGoogleMaps from 'vue2-google-maps'

Vue.use(VueGoogleMaps, {
  load: {
    key: 'AIzaSyCnhZRSzGihwmIMaOhLpBPa-OzEp_sPTZg'
  }
})


new Vue({ router, render: h => h(App) }).$mount('#app')
