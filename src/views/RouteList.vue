<template lang="pug">
section
  .loading(v-if='!routes')
    fa(icon='spinner' spin)

  .card.item.mb-1(v-for='route in routes' v-if='routes')
    .card-body
        .row.align-items-center
          .col-auto
            .name {{ route.name.ch }}
            span(v-if='route.name.hasOwnProperty(`en`)') {{ route.name.en }}
          .col
            .departure
              span {{ route.departure.ch }}
              small(v-if='route.departure.hasOwnProperty(`en`)') {{ route.departure.en }}
            .destination
              span {{ route.destination.ch }}
              small(v-if='route.destination.hasOwnProperty(`en`)') {{ route.destination.en }}
          .col-auto
            router-link.play(:to='`/display/${route.id}`')
              fa(icon='play')
</template>

<script>
import $ from 'jquery'

export default {
  name: 'RouteList',
  data () {
    return {
      routes: null
    }
  },
  mounted () {
    this.fetchList()
  },
  methods: {
    fetchList () {
      const url = `https://busplay-server.herokuapp.com/AllRouteXQ/`
      $.get(url, list => {
        this.routes = list
      })
    }
  }
}
</script>

<style scoped lang="sass">
@import "~bootswatch/dist/lux/variables"
@import "~bootstrap/scss/bootstrap"
@import "~bootswatch/dist/lux/bootswatch"

.loading
  color: white
  font-size: 2rem
  text-align: center

.item
  .name
    font-size: 2rem
    font-weight: 900

  .departure, .destination
    color: $gray-700
    font-size: 1.5rem
    font-weight: bold
    span
      margin-right: .5rem

  .play
    font-size: 1.5rem
    color: $green

</style>
