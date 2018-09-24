<template lang="pug">
div
  gmap-map.google-map(:center='current' :zoom='14' :options='mapOptions')
    gmap-marker.station(:key='index' v-for='(i, index) in route.stations' :position='i.location' :icon='getStationIcon(i, index)')
    gmap-marker.current(:position='current' :icon='busIcon')
    gmap-polyline(:options="polylineOptions" :path='route.stations.map(val => val.location)')
  //- 遙控器
  .controller
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
import $ from 'jquery'
import VueSlider from 'vue-slider-component'

export default {
  name: 'Simulator',
  data () {
    return {
      busIcon: { url: `/img/pin.png` },
      polylineOptions: { geodesic: true, strokeColor: `#15ffe2` },
      mapOptions: { disableDefaultUI: true, styles: [
  {
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
] },
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
    this.fetch()
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
    },
    fetch () {
      const url = ``
      $.ajax({
        url,
        type: 'GET',
        dataType: 'json',
        success: data => {
        },
        error: e => console.log(`取得模擬行車路線失敗`),
      })
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
  margin-top: .5rem
  font-size: 1rem
</style>
