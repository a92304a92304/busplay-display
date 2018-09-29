<template lang="pug">
main
  #display-area(:style='areaStyle' @click.stop='toggleDebugMode()')
    TokyoMetro(ref='TokyoMetro' :ratio='ratio' :data='data' :marquee='marquee' :carousels='carousels' :clock='clock' :htmlFontSize='htmlFontSize' :debugMode='debugMode')

  //- Debug 資訊
  //- 返回按鈕
  transition(name='left-top')
    .debug.back(v-if='debugMode')
      router-link.text-light(to='/' title='返回列表') #[fa(icon='arrow-circle-left' size='4x')]

  //- 站列表
  transition(name='right-top')
    .debug.stations(v-if='debugMode === 1')
      .list
        table(v-if='route')
          tbody
            tr(v-for='(i, index) in route.stations' :class='{ active: index === current, passed: i.passed }')
              td #[fa(icon='arrow-right' v-if='index === current')] {{ i.name.ch }}
              td 距下 {{ i.distance }}m

  //- 前後站和 gps 資訊
  transition(name='right-top')
    .debug.current(v-if='debugMode === 1 && route')
      div(v-if='route.current.prevIndex != null')
        fa(icon='arrow-left')
        span.badge.badge-dark {{ route.current.prevIndex }}
        | {{ route.stations[route.current.prevIndex].name.ch }} : {{ route.current.prevDistance }}m
      div(v-if='route.current.nextIndex != null')
        fa(icon='arrow-right')
        span.badge.badge-dark {{ route.current.nextIndex }}
        | {{ route.stations[route.current.nextIndex].name.ch }} : {{ route.current.nextMinDistance }}m
      .text-light(v-if='position')
        div #[span.badge.badge-light lat] {{ position.latitude }}
        div #[span.badge.badge-light lng] {{ position.longitude }}
        div #[span.badge.badge-warning 誤差] {{ position.accuracy }}m

  //- debug 按鈕
  transition(name='right-bottom')
    .debug.btn(v-if='debugMode === 1')
      .btn-group.btn-group-sm.mb-1
        button.btn.btn-primary(@click='setRatio()') 16:9
        button.btn.btn-primary(@click='setRatio(4,3)') 4:3
        button.btn.btn-dark(@click='enterFullScreen()') 全屏
      br
      .btn-group.btn-group-sm
        button.btn.btn-secondary(@click='$refs.TokyoMetro.toggleTransition()') #[fa(icon='exchange-alt')] main transition
        button.btn.btn-secondary(@click='$refs.TokyoMetro.toggleCarousel()') #[fa(icon='exchange-alt')] carousel
      br
      button.btn.btn-sm.btn-warning(@click='initRoute()') reset route
  transition(name='left-bottom')
    .debug.simulator(v-show='debugMode === 1')
      Simulator(ref='sim' :routeId='routeId' :route='route' :position='position' :direction='direction' :enable='enableSimulator' @changed='setSimulatePosition' @reset='initRoute' )
</template>

<script>
import $ from 'jquery'
import screenfull from 'screenfull'
import moment from 'moment'

import TokyoMetro from '@/template/TokyoMetro'
import ScrollText from '@/components/ScrollText'
import Simulator from '@/components/Simulator'

import { display } from '@/mixins/display'
import gps from '@/assets/js/gps'
import route from '@/assets/js/route'
import carouselController from '@/assets/js/carousel'

import demoRoute from '@/assets/js/demoRoute'

const spotDuration = 7 * 1000  // 景點播放時間
const adDuration = 5 * 1000    // 宣導廣告播放時間
const gpsTimerInterval = 10 * 1000  // 取得 gps 的間隔

export default {
  name: 'Display',
  data () {
    return {
      debugMode: 1,        // Debug Panel: 0: 不顯示, 1: Debug 資訊, 2: 地圖
      position: null,      // 當前 gps 資訊
      //
      current: 0,          // 當前站 index
      gpsTimer: null,      // 儲存gps timer的id
      watchId: null,
      weatherTimer: null,  // 儲存天氣timer的id
      clockTimer: null,
      carousels: [],
    }
  },
  components: {
    TokyoMetro,
    ScrollText,
    Simulator,
  },
  mounted () {
    const vm = this

    vm.setTime()
    vm.fetchWeather()
    vm.setWindow()

    if (!vm.enableSimulator) {
      (async () => {
        const position = await gps.getPosition()  // 取得初始位置
        await vm.fetchRoute(vm.routeId, vm.direction, position)  // 取得路線 data
        vm.startGps()
      })()
    } else {
      (async () => {
        const position = await vm.$refs.sim.fetch()
        vm.setSimulatePosition(position)
        await vm.fetchRoute(vm.routeId, vm.direction, vm.position)
        vm.setSimulatePosition(position)
      })()
    }
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
      // this.gpsTimer = setInterval(this.setGps(), gpsTimerInterval)
      this.setGps()
    },
    // 停止定時取得GPS
    stopGps () {
      // for `getCurrentPosition`
      clearInterval(this.gpsTimer)
      this.gpsTimer = null

      // for `watchPosition`
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    },
    // 取得GPS
    setGps () {
      const vm = this

      if(!vm.watchId && !this.enableSimulator)
        vm.watchId = gps.watchPosition(vm.handlePosition)

      return this.setGps
    },
    setSimulatePosition (position) {
      if(this.enableSimulator)
        this.handlePosition({
          latitude: position.lat,
          longitude: position.lng,
          accuracy: 10,
        })
    },
    handlePosition (position) {
      const vm = this
      vm.position = position

      if (vm.route) {
        route.setCurrent(vm.route, position)
        vm.route.times = route.calcEstTime(vm.route)
      }
      vm.current = (vm.route) ? vm.route.current.nextIndex : 1
      vm.setCarousel()
      vm.setData()
    },
    setData () {
      if(!this.route) return

      const r = this.route
      const current = this.current
      const stations = []
      const times = []

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
        const s = (num >= 0 && num < r.stations.length && r.stations[num]) ? r.stations[num].name : {}
        const t = (num >= 0 && num < r.stations.length && r.stations[num]) ? r.times[num] : null
        stations.push(s)
        times.push(t)
      }

      this.data.stations = stations
      this.data.times = times
    },
    // 設定輪播訊息
    setCarousel () {
      const vm = this
      if (!vm.route) return

      const info = vm.route.stations[this.current].info

      this.carousels.length = 0 // 清空輪播訊息陣列

      // 加入景點訊息
      if (info.spot.length) {
        vm.carousels.push({
          type: `spot`,
          content: info.spot,
          duration: spotDuration,
        })
      }

      // 加入宣導廣告
      carouselController.get(vm.route).forEach(content => {
        vm.carousels.push({
          type: `ad`,
          content: content,
          duration: adDuration,
        })
      })
    },
    initRoute () {
      const vm = this
      console.log(`已重設`)
      vm.fetchRoute(vm.routeId, vm.direction, vm.position)
    },
    fetchRoute (id, direction = `go`, position) {
      return new Promise((resolve, reject) => {
        route.fetchRoute(id, direction, position).then(val => {
          this.route = val
          this.marquee = val.marquee
          resolve()
        })
      })
    },
    // 從api取得天氣物件
    fetchWeather () {
      (async () => {
        const position = await gps.getPosition()
        const url = `https://busplay-server.herokuapp.com/weather/${position.latitude}&${position.longitude}`
        const weather = await $.get(url)

        if(weather.success) this.clock.weather = weather.data
        this.weatherTimer = setTimeout(this.fetchWeather, 1000 * 60 * 10)
      })()
    },
    stopWeather () {
      clearInterval(this.weatherTimer)
      clearInterval(this.clockTimer)
      this.weatherTimer = null
      this.clockTimer = null
    },
    toggleDebugMode () {
      const max = 2
      this.debugMode = ((this.debugMode + 1) + max) % max
    }
  },
  watch: {
    current () {
      this.setData()
    },
    enableSimulator (enable) {
      if (this.enable) {
        this.stopGps()
      } else {
        this.startGps()
      }
      this.initRoute()
    },
  },
  mixins: [display]
}
</script>

<style scoped lang="sass">
@import "../assets/css/display"
</style>
