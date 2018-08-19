import Vue from 'vue'
import Router from 'vue-router'

import Index from '@/components/Index'
import Display from '@/components/Display'
import Login from '@/components/Login'

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
      path: '/display',
      name: 'Display',
      component: Display
    },
  ]
})
