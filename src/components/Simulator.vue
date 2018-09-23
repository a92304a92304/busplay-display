<template lang="pug">
div
  gmap-map.google-map(:center='current' :zoom='14')
    gmap-marker.station(:key='index' v-for='(i, index) in route.stations' :position='i.location' :icon='getStationIcon(i, index)')
    gmap-marker.current(:position='current' :icon='busIcon')
    gmap-polyline(:options="polylineOptions" :path='route.stations.map(val => val.location)')
  .controller.mt-1
    .row.align-items-center.no-gutters
      .col-auto
        fa.mr-2(icon='fast-backward' @click='reset()')
        fa.mr-2(icon='pause' @click='pause()' v-if='timer !== null')
        fa.mr-2(icon='play' @click='play()' v-else)
      .col
        VueSlider(v-model='sliderValue' :min='sliderMin' :max='sliderMax' :tooltip='`hover`' :speed='.2' :bgStyle='{ background: `white` }')
      .col-auto {{ sliderValue }}
</template>

<script>
import VueSlider from 'vue-slider-component'

export default {
  name: 'Simulator',
  data () {
    return {
      busIcon: { url: `/img/pin.png` },
      polylineOptions: { geodesic: true, strokeColor: `#15ffe2` },
      sliderValue: 0,
      sliderMin: 0,
      sliderMax: 1000,
      timer: null,
    }
  },
  props:{
    route: { type: Object, default: {} },
    position: { type: Object, default: {} },
  },
  mounted () {

  },
  methods: {
    // 取得站 Marker 的 Icon
    getStationIcon (station, index) {
      let url = `/img/marker-default.png`

      if(index === this.route.current.nextIndex) url = `/img/marker-current.png`
      else if (station.passed) url = `/img/marker-passed.png`

      return { url }
    },
    play () {
      if (this.timer === null) {
        this.timer = setInterval(() => {
          this.sliderValue++
        }, 100)
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
    }
  },
  computed: {
    current () {
      return { lat: this.position.latitude, lng: this.position.longitude }
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
  width: 30rem
  height: 20rem

.controller
</style>
