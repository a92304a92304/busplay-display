<template lang="pug">
section
  h4.text-light 演示路線
  RouteListItem.mb-5(:route='demoRoute' v-if='demoRoute' :config='config')

  h4.text-light
    | 線上路線列表
    a.text-light(href='#' @click.stop.prevent='fetchList()') #[fa.ml-3(icon='sync-alt' title='重新載入列表')]

  .loading(v-if='!routes') #[fa(icon='spinner' spin)]
  RouteListItem.fade-enter-active(v-for='(route, index) in routes' :route='route' :index='index' :key='index' :config='config')

  .text-center(v-if='routes')
    button.btn.btn-outline-secondary.my-3(@click='gotoTop()')
      fa.mx-5(icon='caret-up' size="2x")
</template>

<script>
import $ from 'jquery'
import RouteListItem from '@/components/RouteListItem'
import demoRoute from '@/assets/js/demoRoute'

export default {
  name: 'RouteList',
  data () {
    return {
      routes: null,
      demoRoute: null,
    }
  },
  props:{
    config: {
      type: Object,
      default () { return  { position: `gps` }  }
    },
  },
  mounted () {
    this.setDemoRoute()
    this.fetchList()

    $('html').css('font-size', `14px`)
  },
  methods: {
    fetchList () {
      const url = `https://busplay-server.herokuapp.com/AllRouteXQ/`
      this.routes = null
      $.get(url, list => this.routes = JSON.parse(list))
    },
    gotoTop () {
      document.body.scrollTop = 0
      document.documentElement.scrollTop = 0
    },
    setDemoRoute () {
      const demo = demoRoute.route
      this.demoRoute = {
        name: demo.routeName,
        departure: demo.departureName,
        destination: demo.destinationName,
        id: `demo`,
        RID: `demo`,
        color: ``,
      }
    }
  },
  components: {
    RouteListItem
  }
}
</script>

<style scoped lang="sass">
@import "~bootswatch/dist/lux/variables"
@import "~bootstrap/scss/bootstrap"
@import "~bootswatch/dist/lux/bootswatch"

.loading
  color: white
  font-size: 2rem
  text-align: center

@keyframes fade
  from
    opacity: 0
    transform: translateY(1rem)
  to
    opacity: 1

.fade-enter-active
  animation: fade .5s
  animation-fill-mode: backwards
</style>
