<template lang="pug">
main
  #display-area(:style='areaStyle' @click.stop='debugMode = !debugMode')
    TokyoMetro(ref='TokyoMetro' :ratio='ratio' :data='data' :marquee='marquee' :carousels='carousels' :clock='clock' :htmlFontSize='htmlFontSize')

  //- Debug 資訊
  .debug.img(v-if='debugMode')
    img.img-fluid(v-if='position' :src='position.img')

  .debug.stations(v-if='debugMode')
    .list
      table(v-if='route')
        tbody
          tr(v-for='(i, index) in route.stations' :class='{ active: index === current, passed: i.passed }')
            td #[fa(icon='arrow-right' v-if='index === current')] {{ i.name.ch }}
            td 距下 {{ i.distance }}m

  .debug.current(v-if='debugMode && route')
    div #[fa(icon='arrow-left')] #[span.badge.badge-dark {{ route.current.prevIndex }}] {{ route.stations[route.current.prevIndex].name.ch }} - {{ route.current.prevDistance }}m
    div #[fa(icon='arrow-right')] #[span.badge.badge-dark {{ route.current.nextIndex }}] {{ route.stations[route.current.nextIndex].name.ch }} - {{ route.current.nextMinDistance }}m
    .text-light(v-if='position')
      div #[span.badge.badge-light lat] {{ position.latitude }}
      div #[span.badge.badge-light lng] {{ position.longitude }}
      div #[span.badge.badge-warning 誤差] {{ position.accuracy }}m

  .debug.btn(v-if='debugMode')
    .btn-group.btn-group-sm
      button.btn.btn-primary(@click='setRatio()') 16:9
      button.btn.btn-primary(@click='setRatio(4,3)') 4:3
      button.btn.btn-dark(@click='enterFullScreen()') 全屏
    br
    .btn-group.btn-group-sm
      button.btn.btn-danger(@click='current--') #[fa(icon='angle-left')]
      button.btn.btn-danger(@click='current++') #[fa(icon='angle-right')]
      button.btn.btn-secondary(@click='toggleTransition()') toggle transition
      button.btn.btn-secondary(@click='$refs.TokyoMetro.toggleCarousel()') toggle btm
      button.btn.btn-warning(@click='initRoute()') reset route
</template>

<script>
import $ from 'jquery'
import screenfull from 'screenfull'
import moment from 'moment'

import TokyoMetro from '@/components/TokyoMetro'
import ScrollText from '@/components/ScrollText'

import { display } from '@/mixins/display'
import gps from '@/assets/js/gps'
import route from '@/assets/js/route'

export default {
  name: 'Display',
  data () {
    return {
      debugMode: true,     // 是否顯示debug panel
      position: null,      // 當前 gps 資訊
      current: 0,          // 當前站 index
      gpsTimer: null,      // 儲存gps timer的id
      weatherTimer: null,  // 儲存天氣timer的id
      clockTimer: null,
      gpsTimerInterval: 5000,  // 取得 gps 的間隔
      carousels: [],
    }
  },
  components: {
    TokyoMetro,
    ScrollText,
  },
  mounted () {
    const vm = this
    const routeId = vm.$route.params.id
    vm.setTime()
    vm.fetchWeather()
    vm.setWindow()
    // 取得路線 data
    vm.fetchRoute(routeId).then(() => {
      vm.startGps()
    })
    console.log(  this.$refs.TokyoMetro)

  },
  methods: {
    // 設定當前時間
    setTime () {
      const h = moment().format('HH')
      const m = moment().format('mm')
      this.clock.time = `${h}:${m}`

      this.clockTimer = setTimeout(this.setTime, 10000)
    },
    // 開始定時取得GPS
    startGps () {
      this.gpsTimer = setInterval(this.setGps(), this.gpsTimerInterval)
    },
    // 停止定時取得GPS
    stopGps () {
      clearInterval(this.gpsTimer)
      this.gpsTimer = null
    },
    // 取得GPS
    setGps () {
      const vm = this

      gps.getPosition().then((position) => {
        vm.position = position
        route.setCurrent(vm.route, position)
        vm.current = vm.route.current.nextIndex
        vm.setCarousel()
        vm.setData()
      })

      return this.setGps
    },
    setData () {
      if(!this.route) return

      const r = this.route
      const current = this.current
      const stations = []

      // 將資料轉換為TokyoMetro接收的格式
      this.data = {
        routeName: r.routeName,
        departureName: r.departureName,
        destinationName: r.destinationName,
        color: r.themeColor,
        thisStop: r.stations[current].name,
      }

      // 放入要顯示的7個站
      for (let i = 0; i < 7; i++) {
        const num = i + current - 1
        const s = (num >= 0 && num < r.stations.length) ? r.stations[num].name : {}
        stations.push(s)
      }

      this.data.stations = stations
    },
    setCarousel () {
      const vm = this
      const info = vm.route.stations[this.current].info
      const duration = 8000
      this.carousels.length = 0 // 清空輪播訊息陣列

      if (info.spot.length) {
        vm.carousels.push({
          type: `spot`,
          content: info.spot,
          duration,
        })
      }
    },
    initRoute () {
      route.initNewRoute(this.route)
    },
    fetchRoute (id) {
      return new Promise((resolve, reject) => {
        route.fetchRoute(id).then(val => {
          this.route = val
          this.marquee = val.marquee
          resolve()
        })
      })
    },
    // 從api取得天氣物件
    fetchWeather () {
      const vm = this
      gps.getPosition().then((position) => {
        const url = `https://busplay-server.herokuapp.com/weather/${position.latitude}&${position.longitude}`
        console.log(url)
        $.get(url, weather => {
          if(weather.success) vm.clock.weather = weather.data
        })
        vm.weatherTimer = setTimeout(this.fetchWeather, 1000 * 60 * 10)
      })
    },
    stopWeather () {
      clearInterval(this.weatherTimer)
      clearInterval(this.clockTimer)
      this.weatherTimer = null
      this.clockTimer = null
    },
  },
  watch: {
    current () {
      this.setData()
    },
  },
  mixins: [display]
}
</script>

<style scoped lang="sass">
@import "~bootswatch/dist/lux/variables"
@import "~bootstrap/scss/bootstrap"
@import "~bootswatch/dist/lux/bootswatch"

main
  display: flex
  justify-content: center
  align-items: center
  width: 100%

#display-area
  overflow: hidden
  border: 1px solid $gray-300

.test
  border: 1px solid $gray-300
  width: 50%

.debug
  background-color: rgba(black, .9)
  font-size: .7rem
  color: white
  z-index: 9999
  overflow: hidden
  position: absolute
  opacity: .9
  padding: .5rem
  &.img
    bottom: 0
    left: 0
    height: 300px
    width: 300px
    padding: 0
    margin: 0
  &.stations
    position: absolute
    top: 0
    right: 0
    width: 15rem
    .list
      height: 10rem
      overflow: scroll
      table
        tr
          &.active
            background-color: $yellow
          &.passed
            background-color: rgba($yellow, .5)
        td
          padding: 0 .2rem

  &.current
    top: 0
    right: calc(15rem + .5rem)
    color: $yellow

  &.btn
    bottom: 1rem
    right: 1rem
    text-align: left
</style>
