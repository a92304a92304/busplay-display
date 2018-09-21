<template lang="pug">
div
  gmap-map.google-map(:center='route.stations[Math.floor(route.stations.length / 2)].location' :zoom='11')
    gmap-marker.current(:position='current' :icon='busIcon')
    gmap-marker(:key='index', v-for='(i, index) in route.stations' :position='i.location' :icon='stationIcon')
    gmap-polyline(:options="polylineOptions" :path='route.stations.map(val => val.location)')
</template>

<script>
export default {
  name: 'Simulator',
  data () {
    return {
      stationIcon: { url: `/img/marker-default.png` },
      busIcon: { url: `/img/pin.png` },
      polylineOptions: { geodesic: true, strokeColor: `#15ffe2` },
    }
  },
  props:{
    route: { type: Object, default: {} },
    position: { type: Object, default: {} }
  },
  methods: {
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
  width: 500px
  height: 300px

.current
  z-index: 100000
</style>
