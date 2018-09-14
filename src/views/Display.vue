<template lang="pug">
main
  #display-area(:style='areaStyle' @click.stop='debugMode=!debugMode')
    TokyoMetro(ref='TokyoMetro' :ratio='ratio' :data='data' :marquee='marquee' :clock='clock')

  //- Debug 資訊
  .position-absolute(style={top:0,left:0,height:`300px`,width:`300px`,zIndex:1000} v-if='debugMode')
    img.img-fluid(v-if='position' :src='position.img')
  .debug-stations(v-if='debugMode')
    .list
      table(v-if='route')
        tbody
          tr(v-for='(i, index) in route.stations' :class='{ active: index == current, passed: i.passed }')
            td {{ i.name.ch }}
            td 距下 {{ i.distance }}m
    .current(v-if='route')
      div 前 [{{ route.current.prevIndex }}] {{ route.stations[route.current.prevIndex].name.ch }}, {{ route.current.prevDistance }}m
      div 下 [{{ route.current.nextIndex }}] {{ route.stations[route.current.nextIndex].name.ch }}, {{ route.current.nextMinDistance }}m
  .alert.alert-info.debug-box(v-if='debugMode')
    h6.alert-heading.my-0 Debug Panel
    div
      .btn-group.btn-group-sm
        button.btn.btn-primary(@click='setRatio()') 16:9
        button.btn.btn-primary(@click='setRatio(4,3)') 4:3
        button.btn.btn-secondary(@click='enterFullScreen()') 全屏
      br
      .btn-group.btn-group-sm
        button.btn.btn-danger(@click='current--') #[fa(icon='angle-left')]
        button.btn.btn-danger(@click='current++') #[fa(icon='angle-right')]
        button.btn.btn-secondary(@click='toggleTransition()') 換轉場效果
        button.btn.btn-warning(@click='initRoute()') init route
        button.btn.btn-info(onclick="javascript:window.location.reload()") Refresh
</template>

<script>
import $ from 'jquery'
import screenfull from 'screenfull'
import moment from 'moment'

import TokyoMetro from '@/components/Layout/TokyoMetro'
import ScrollText from '@/components/Layout/ScrollText'

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
      gpsTimer: null,      // 儲存 gps timer 的 id
      weatherTimer: null,
      gpsTimerInterval: 5000,  // 取得 gps 的間隔
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

  },
  methods: {
    // 設定當前時間
    setTime () {
      const h = moment().format('HH')
      const m = moment().format('mm')
      const s = moment().format('ss')
      this.clock.time = (s % 2 == 0) ? `${h}:${m}` : `${h} ${m}`

      setTimeout(this.setTime, 1000)
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
        // TODO: 改寫此處
        vm.position = position

        route.setCurrent(vm.route, position)
        vm.current = vm.route.current.nextIndex
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
        routeName: r.routeName.ch,
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
        $.get(url, weather => {
          if(weather.success) vm.clock.weather = weather.data
        })
        vm.weatherTimer = setTimeout(this.fetchWeather, 1000 * 60 * 10)
      })
    },
    stopWeather () {
      clearInterval(this.weatherTimer)
      this.weatherTimer = null
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
@import "~bootstrap/scss/functions"
@import "~bootstrap/scss/variables"
@import "~bootstrap/scss/mixins"

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

.debug-stations
  background-color: rgba(black, .7)
  color: white
  font-size: .8rem
  position: absolute
  top: 0
  right: 0
  width: 15rem
  zIndex: 10000
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
  .current
    padding: .2rem
    color: $yellow


</style>
