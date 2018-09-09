<template lang="pug">
main
  #display-area(:style='areaStyle' @click.stop='debugMode=!debugMode')
    TokyoMetro(ref='TokyoMetro' :ratio='ratio' :data='data' :clock='clock')
  .position-absolute(style={top:0,left:0,height:`300px`,width:`300px`,zIndex:1000} v-if='debugMode')
    img.img-fluid(v-if='position' :src='position.img')
  .alert.alert-info.debug-box(v-if='debugMode')
    h6.alert-heading.my-0 Debug Panel
    div
      div
      .btn-group.btn-group-sm
        button.btn.btn-primary(@click='setRatio()') 16:9
        button.btn.btn-primary(@click='setRatio(4,3)') 4:3
        button.btn.btn-secondary(@click='enterFullScreen ()') fullscreen
      br
      .btn-group.btn-group-sm
        button.btn.btn-danger(@click='current--') #[fa(icon='angle-left')]
        button.btn.btn-danger(@click='current++') #[fa(icon='angle-right')]
        button.btn.btn-secondary(@click='toggleTransition()') 換轉場效果
        button.btn.btn-info(onclick="javascript:window.location.reload()") Refresh
</template>

<script>
import $ from 'jquery'
import screenfull from 'screenfull'
import firebase from 'firebase/app'
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
      gpsTimerInterval: 10000,  // 取得 gps 的間隔
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

      gps.getPosition().then((result) => {
        // TODO: 改寫此處
        const current = [result.latitude, result.longitude]
        const stationsForCalc = []

        vm.position = result

        vm.route.stations.forEach((val) => {
          stationsForCalc.push([parseFloat(val.location.lat), parseFloat(val.location.lng)])
        })

        vm.current = gps.getNearest(current, stationsForCalc) // 主要改這個
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
    fetchRoute (id) {
      return new Promise((resolve, reject) => {
        route.fetchRoute(id).then(val => {
          this.route = val
          resolve()
        })
      })
    },
    // 當 nextDest.minDistance 為 null 時，設定出發的站
    setInitStation () {
      this.route.nextDest.stationIndex
      this.route.nextDest.minDistance
    },
    // 從api取得天氣物件
    fetchWeather () {
      // TODO: 改用鎧企api
      const vm = this
      const url = 'https://works.ioa.tw/weather/api/weathers/5.json'

      $.get(url, weather => vm.clock.weather = weather)
      setTimeout(this.fetchWeather, 1000 * 60 * 10)
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
</style>
