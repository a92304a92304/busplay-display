import Vue from 'vue'
import Router from 'vue-router'

import Index from '@/views/Index'
import Display from '@/views/Display'
import Config from '@/views/Config'

Vue.use(Router)

export default new Router({
  routes: [
    { path: "*", redirect: "/" },   // 若為為定義的路由則導回首頁
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
    {
      path: '/config',
      name: 'Config',
      component: Config
    },
  ]
})
