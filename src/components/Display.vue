<template lang="pug">
main
  #display-area(:style='areaStyle')
    TokyoMetro(ref='TokyoMetro' :ratio='ratio' :data='data' :clock='clock')
  .position-absolute(style={top:0,left:0,height:`300px`,width:`300px`,zIndex:1000})
    img.img-fluid(v-if='location' :src='location.img')
  .alert.alert-info.debug-box
    h6.alert-heading.my-0(@click='debugMode=!debugMode') Debug Panel
    div(v-if='debugMode')
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

export default {
  name: 'Display',
  data () {
    return {
      debugMode: true,     // 是否顯示debug panel
      locationImg: null,
      location: null,
      current: 0,
      gpsTimer: null,
      gpsTimerInterval: 10000,
    }
  },
  components: {
    TokyoMetro,
    ScrollText,
  },
  // 元素已掛載時
  mounted () {
    const vm = this

    vm.setWindow()
    vm.setTime()
    vm.fetchWeather()
    vm.fetchRoute(`5b819a1ac8b5230c2ccf6390`)
    vm.startGps()
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
      const vm = this
      this.gpsTimer = setInterval(() => {
        vm.setGps()
      }, this.gpsTimerInterval)
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
        const current = [result.latitude, result.longitude]
        const stationsForCalc = []

        vm.position = result

        vm.route.stations.forEach((val) => {
          stationsForCalc.push([parseFloat(val.location.lat), parseFloat(val.location.lng)])
        })

        vm.current = gps.getNearest(current, stationsForCalc)
        vm.setData()
      })
    },
    setData () {
      if(!this.route) return
      const r = this.route
      const current = this.current

      this.data = {
        routeName: r.routeName.ch,
        departureName: r.departureName,
        destinationName: r.destinationName,
        color: r.themeColor,
        thisStop: r.stations[current].name,
      }

      const stations = []

      for (var i = 0; i < 7; i++) {
        const num = i + current - 1
        const s = (num >= 0 && num < r.stations.length) ? r.stations[num].name : {}
        stations.push(s)
      }

      this.data.stations = stations
    },
    fetchRoute (id) {
      const vm = this
      const url = `https://busplay-server.herokuapp.com/OneRouteXQ/${id}`

      $.ajax({
        url,
        type: 'GET',
        dataType: 'json',
        success (data) {
          vm.route = data
          vm.setData()
        }
      })
    },
    // 從api取得天氣物件
    fetchWeather () {
      const vm = this
      const url = 'https://works.ioa.tw/weather/api/weathers/5.json'

      $.get(url, weather => vm.clock.weather = weather)
      setTimeout(this.fetchWeather, 1000 * 60 * 10)
    },
    // 切換過場動畫
    toggleTransition () {
      this.$refs.TokyoMetro.toggleTransition()
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
