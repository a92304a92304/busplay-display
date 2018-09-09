import Vue from 'vue'
import Router from 'vue-router'

import Index from '@/views/Index'
import Display from '@/views/Display'

Vue.use(Router)

export default new Router({
  routes: [
    { path: "*", redirect: "/" },
    {
      path: '/',
      name: 'index',
      component: Index
    },
    {
      path: '/display/:id',
      name: 'Display',
      component: Display
    },
  ]
})
