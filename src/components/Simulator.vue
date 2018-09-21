<template lang="pug">
div
  gmap-map.google-map(:center='current' :zoom='14')
    gmap-marker.station(:key='index' v-for='(i, index) in route.stations' :position='i.location' :icon='getStationIcon(i, index)')
    gmap-marker.current(:position='current' :icon='busIcon')
    gmap-polyline(:options="polylineOptions" :path='route.stations.map(val => val.location)')
  .controller.mt-1
    fa.mr-1(icon='pause')
    fa(icon='play')
</template>

<script>
export default {
  name: 'Simulator',
  data () {
    return {
      busIcon: { url: `/img/pin.png` },
      polylineOptions: { geodesic: true, strokeColor: `#15ffe2` },
    }
  },
  props:{
    route: { type: Object, default: {} },
    position: { type: Object, default: {} },
  },
  methods: {
    // 取得站 Marker 的 Icon
    getStationIcon (station, index) {
      let url = `/img/marker-default.png`

      if(index === this.route.current.nextIndex) url = `/img/marker-current.png`
      else if (station.passed) url = `/img/marker-passed.png`

      return { url }
    }
  },
  computed: {
    current () {
      return { lat: this.position.latitude, lng: this.position.longitude }
    }
  }
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
