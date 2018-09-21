<template lang="pug">
main
  #display-area(:style='areaStyle' @click.stop='toggleDebugMode()')
    TokyoMetro(ref='TokyoMetro' :ratio='ratio' :data='data' :marquee='marquee' :carousels='carousels' :clock='clock' :htmlFontSize='htmlFontSize' :debugMode='debugMode')

  //- Debug 資訊
  //- 返回按鈕
  .debug.back(v-if='debugMode')
    router-link.text-light(to='/' title='返回列表') #[fa(icon='arrow-circle-left' size='4x')]

  //- Google Maps
  //- .debug.img(v-if='debugMode')
    img.img-fluid(v-if='position' :src='position.img')

  //- 站列表
  .debug.stations(v-if='debugMode === 1')
    .list
      table(v-if='route')
        tbody
          tr(v-for='(i, index) in route.stations' :class='{ active: index === current, passed: i.passed }')
            td #[fa(icon='arrow-right' v-if='index === current')] {{ i.name.ch }}
            td 距下 {{ i.distance }}m

  //- 前後站和 gps 資訊
  .debug.current(v-if='debugMode === 1 && route')
    div #[fa(icon='arrow-left')] #[span.badge.badge-dark {{ route.current.prevIndex }}] {{ route.stations[route.current.prevIndex].name.ch }} : {{ route.current.prevDistance }}m
    div #[fa(icon='arrow-right')] #[span.badge.badge-dark {{ route.current.nextIndex }}] {{ route.stations[route.current.nextIndex].name.ch }} : {{ route.current.nextMinDistance }}m
    .text-light(v-if='position')
      div #[span.badge.badge-light lat] {{ position.latitude }}
      div #[span.badge.badge-light lng] {{ position.longitude }}
      div #[span.badge.badge-warning 誤差] {{ position.accuracy }}m

  //- debug 按鈕
  .debug.btn(v-if='debugMode === 1')
    .btn-group.btn-group-sm.mb-1
      button.btn.btn-primary(@click='setRatio()') 16:9
      button.btn.btn-primary(@click='setRatio(4,3)') 4:3
      button.btn.btn-dark(@click='enterFullScreen()') 全屏
    .btn-group.btn-group-sm('hidden')
      button.btn.btn-primary(@click='current--') #[fa(icon='angle-left')]
      button.btn.btn-primary(@click='current++') #[fa(icon='angle-right')]
    br
    .btn-group.btn-group-sm
      button.btn.btn-secondary(@click='$refs.TokyoMetro.toggleTransition()') #[fa(icon='exchange-alt')] main transition
      button.btn.btn-secondary(@click='$refs.TokyoMetro.toggleCarousel()') #[fa(icon='exchange-alt')] carousel
      button.btn.btn-warning(@click='initRoute()') reset route

  .debug.simulator(v-if='debugMode === 2 &&route && position')
    Simulator(:route='route' :position='position')
</template>

<script>
import $ from 'jquery'
import screenfull from 'screenfull'
import moment from 'moment'

import TokyoMetro from '@/components/TokyoMetro'
import ScrollText from '@/components/ScrollText'
import Simulator from '@/components/Simulator'

import { display } from '@/mixins/display'
import gps from '@/assets/js/gps'
import route from '@/assets/js/route'
import carouselController from '@/assets/js/carousel'


import demoRoute from '@/assets/js/demoRoute'

export default {
  name: 'Display',
  data () {
    return {
      debugMode: 2,        // Debug Panel: 0: 不顯示, 1: Debug 資訊, 2: 地圖
      position: null,      // 當前 gps 資訊
      current: 0,          // 當前站 index
      gpsTimer: null,      // 儲存gps timer的id
      weatherTimer: null,  // 儲存天氣timer的id
      clockTimer: null,
      gpsTimerInterval: 10 * 1000,  // 取得 gps 的間隔
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
    const routeId = vm.$route.params.id
    vm.setTime()
    vm.fetchWeather()
    vm.setWindow()
    vm.setDirection()

    vm.fetchRoute(routeId, vm.direction).then(() => {   // 取得路線 data
      vm.startGps()
    })

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
      const spotDuration = 7000
      const adDuration = 5000

      this.carousels.length = 0 // 清空輪播訊息陣列

      if (info.spot.length) {
        vm.carousels.push({
          type: `spot`,
          content: info.spot,
          duration: spotDuration,
        })
      }

      carouselController.get(vm.route).forEach(content => {
        vm.carousels.push({
          type: `ad`,
          content: content,
          duration: adDuration,
        })
      })

      // const testAdImg = [`https://i.imgur.com/WEJUNI5.jpg`, `https://i.imgur.com/qcMD0zD.jpg`, `https://i.imgur.com/QZ7z7ao.jpg`]
      // testAdImg.forEach((img) => {
      //   vm.carousels.push({
      //     type: `ad`,
      //     content: {
      //       title: { ch: null, en: null },
      //       content: { ch: null, en: null },
      //       img
      //     },
      //     duration: 5000,
      //   })
      // })
      //
      // vm.carousels.push({
      //   type: `ad`,
      //   content: {
      //     title: {
      //       ch: `乘車注意事項`,
      //       en: `Notice`,
      //     },
      //     content: {
      //       ch: `為了維護服務品質，請勿在車內吸煙、飲食、嚼食口香糖或檳榔，謝謝您的配合，祝您旅途愉快。`,
      //       en: `Please do not smoke, eat, drink, chew gum or betel nut in the car. Have a nice trip.`
      //     },
      //     img: `https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/No_smoking_symbol.svg/2000px-No_smoking_symbol.svg.png`
      //   },
      //   duration: 5000,
      // })
      // vm.carousels.push({
      //   type: `ad`,
      //   content: {
      //     title: {
      //       ch: `博愛座`,
      //       en: `Priority Seat`,
      //     },
      //     content: {
      //       ch: `請優先讓位給老人、孕婦、行動不便者，及抱小孩的乘客。`,
      //       en: `Priority to senior citizen, pregnant and passenger who is disabled or with child.`
      //     },
      //     img: `https://i.imgur.com/w30cXdK.jpg?博愛座`
      //   },
      //   duration: 5000,
      // })
    },
    initRoute () {
      const vm = this
      const routeId = vm.$route.params.id
      vm.fetchRoute(routeId, vm.direction)
    },
    fetchRoute (id, direction = `go`) {
      return new Promise((resolve, reject) => {
        route.fetchRoute(id, direction).then(val => {
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
      clearInterval(this.clockTimer)
      this.weatherTimer = null
      this.clockTimer = null
    },
    toggleDebugMode () {
      const max = 3
      this.debugMode = ((this.debugMode + 1) + max) % max
    }
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
@import "../assets/css/display"
</style>
