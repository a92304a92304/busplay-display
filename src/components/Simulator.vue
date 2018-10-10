<template lang="pug">
div
  gmap-map.google-map(:center='googleMapsCenter' :zoom='15' :options='mapOptions')
    //- 各站點
    gmap-marker.station(:key='`station${index}`' v-for='(i, index) in stations' :position='i.location' :icon='getStationIcon(i, index)')
    //- 當前位置
    gmap-marker.current(:position='current' :icon='busIcon')
    //- 各站點連接直線
    gmap-polyline(:options="stationLineOptions" :path='stations.map(val => val.location)')
    //- 模擬行車點
    gmap-marker(:key='`s${index}`' :icon='{ url: `/img/marker-simulator.png` }' v-for='(i, index) in simulateSpotsForGoogleMaps' :position='i')
  //- 遙控器
  .controller
    .row.align-items-center.no-gutters(v-if='data && enable')
      .col-auto
        a(href='#' @click='reset()' title='歸零') #[fa.mr-2(icon='fast-backward')]
        a(href='#' @click='pause()' v-if='timer !== null' title='暫停') #[fa.mr-2(icon='pause')]
        a(href='#' @click='play()' v-else title='播放') #[fa.mr-2(icon='play')]

      .col
        VueSlider(v-model='sliderValue' :min='sliderMin' :max='sliderMax' :tooltip='`hover`' :speed='0' :bgStyle='{ background: `white` }' :real-time='true')
      .col-auto
        div(style={ minWidth: `2rem` }) {{ ((sliderValue / sliderMax) * 100).toFixed(0) }} %
    div(v-else-if='!enable')
    div(v-else) #[fa(icon='circle-notch' spin)]
</template>

<script>
import $ from 'jquery'
import VueSlider from 'vue-slider-component'
import simulator from '@/assets/js/simulator.js'

const playSpeed = 400

export default {
  name: 'Simulator',
  data () {
    return {
      busIcon: { url: `/img/pin.png` },
      stationLineOptions: { geodesic: true, strokeColor: `#15ffe2` },
      simulateLineOptions: { geodesic: true, strokeColor: `#ffe235` },
      mapOptions: { disableDefaultUI: true, styles: simulator.mapStyle },
      sliderValue: 0,
      sliderMin: 0,
      timer: null,
      data: null,
      counter: 0
    }
  },
  props: {
    routeId: { },
    route: { type: Object, default: null },
    position: { type: Object, default: null },
    direction: { type: String, default: `go` },
    enable: { type: Boolean, default: false },
  },
  methods: {
    // 取得站 Marker 的 Icon
    getStationIcon (station, index) {
      let url = `/img/marker-default.png` // 預設 icon
      if (!this.position) return url

      if(index === this.route.current.nextIndex) url = `/img/marker-current.png`
      else if (station.passed) url = `/img/marker-passed.png`

      return { url }
    },
    play () {
      if (this.timer === null) {
        this.timer = setInterval(() => {
          if (this.sliderValue >= this.sliderMax - 1) this.pause()
          else this.sliderValue++
        }, playSpeed)
      }
    },
    pause () {
      if (this.timer !== null) {
        clearInterval(this.timer)
        this.timer = null
      }
    },
    // 重設值為 0 並暫停播放
    reset () {
      this.pause()
      this.sliderValue = 0
      this.$emit(`reset`)
    },
    fetch () {
      let url = `https://busplay-server.herokuapp.com/display/simulator/${this.routeId}`

      if(this.routeId === `demo`) url = `https://busplay-server.herokuapp.com/display/simulator/4`

      return new Promise((resolve, reject) => {
        $.ajax({
          url,
          type: 'GET',
          dataType: 'json',
          success: result => {
            this.data = result.data
            resolve(this.simulateCurrent)
          },
          error: e => reject(e),
        })
      })
    },
    // 向父組件傳遞模擬的 GPS 資訊
    sendSimulatePosition (position) {
      this.$emit(`changed`, position)
    },
  },
  computed: {
    // 取得滑動條的最大值
    sliderMax () {
      return (this.data) ? this.data.length : 0
    },
    // 真實 GPS 位置
    current () {
      if (!this.position) return { lat: 25.0397526, lng: 121.5370866 }
      return { lat: this.position.latitude, lng: this.position.longitude }
    },
    // 取得模擬點列表
    simulateSpots () {
      return (this.data) ? this.data.stations[this.direction] : []
    },
    simulateSpotsForGoogleMaps () {
      if (!this.data) return []
      const numToShow = 10
      const value = this.sliderValue
      const max = this.sliderMax
      const result = []
      for (let i = value - numToShow; i < value + numToShow; i++) {
        if (i >= 0 && i < max) result.push(this.simulateSpots[i])
      }
      return result
    },
    // 模擬 GPS 位置
    simulateCurrent () {
      if (!this.data) return null
      return this.simulateSpots[this.sliderValue]
    },
    // Google Maps 中心點
    googleMapsCenter () {
      const taipei = { lat: 25.0422377, lng: 121.5333034 }

      if(!this.enable) return this.current // 若禁用模擬器則回傳 真實GPS位置
      else if (!this.data) return taipei  // 若尚未取得模擬點列表
      else if (this.sliderValue >= this.sliderMax) return taipei

      return this.simulateCurrent // 當前模擬 GPS 位置
    },
    // 車站列表
    stations () {
      return (this.route) ? this.route.stations : []
    },
  },
  watch: {
    simulateCurrent (value) {
      if(this.counter++ <= 0) return
      if(this.enable) this.sendSimulatePosition(value)
    },
    // 若偵測到倒轉播放則重設
    sliderValue (value, old) {
      if(value < old) this.$emit(`reset`)
    }
  },
  components: {
    VueSlider
  },
}
</script>

<style scoped lang="sass">
@import "~bootswatch/dist/lux/variables"
@import "~bootstrap/scss/bootstrap"
@import "~bootswatch/dist/lux/bootswatch"

.google-map
  width: 24rem
  height: 18rem

.controller
  margin-top: .5rem
  font-size: .8rem
  a
    color: white
    transition: color .2s
    &:hover
      color: $yellow
</style>
