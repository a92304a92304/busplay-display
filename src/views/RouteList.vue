<template lang="pug">
section
  .loading(v-if='!routes')
    fa(icon='spinner' spin)

  transition-group(name='fade')
    .card.item.mb-2(v-for='(route, index) in routes' v-if='routes' :key='index' :style='{ borderLeftColor: route.color, animationDelay: `${index * 0.05}s` }')
      router-link.card-body(:to='`/display/${route.id}`')
        .row.align-items-center
          .col-auto.text-center
            .name {{ route.name.ch }}
            span(v-if='route.name.hasOwnProperty(`en`)') {{ route.name.en }}
          .col
            .departure
              fa.mr-2(icon='map-marker' size="xs")
              span {{ route.departure.ch }}
              small(v-if='route.departure.hasOwnProperty(`en`)') {{ route.departure.en }}
            .destination
              fa.mr-2(icon='angle-right')
              span {{ route.destination.ch }}
              small(v-if='route.destination.hasOwnProperty(`en`)') {{ route.destination.en }}
          //- .col-auto
            button.btn.btn-dark 去
            button.btn.btn-dark 返
  .text-center(v-if='routes')
    button.btn.btn-outline-secondary.my-3(@click='gotoTop()')
      fa.mx-5(icon='caret-up' size="2x")
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
    $('html').css('font-size', `14px`)
  },
  methods: {
    fetchList () {
      const url = `https://busplay-server.herokuapp.com/AllRouteXQ/`
      $.get(url, list => this.routes = list )
    },
    gotoTop () {
      document.body.scrollTop = 0
      document.documentElement.scrollTop = 0
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
  border-left: .5rem solid #bbb
  text-align: left
  .card-body
    display: block
    &:hover
      background-color: $gray-300
      text-decoration: none
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

@keyframes fade
  from
    opacity: 0
    transform: translateY(1rem)
  to
    opacity: 1

.fade-enter-active
  animation: fade .5s
  animation-fill-mode: backwards
</style>
