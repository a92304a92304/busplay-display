<template lang="pug">
main
  .container
    .row.justify-content-between.align-items-center.mb-3
      .col-auto
        h1.logo.mt-2
          img.img-fluid.mr-1(src='@/assets/img/logo.svg' style={ height: `3rem` })
          span Busplay
    .row.config.mb-5
      .col-12
        h2 位置取得方式
      .col-12
        .btn-group
          button.btn.btn-secondary(:class='positionBtnClass(`gps`)' @click='config.position = `gps`') 裝置 GPS
          button.btn.btn-secondary(:class='positionBtnClass(`simulator`)' @click='config.position = `simulator`') 行車模擬器
    RouteList(:config='config').mb-5
</template>

<script>
import RouteList from '@/views/RouteList'

export default {
  name: 'Index',
  data () {
    return {
      config: { position: `gps` }
    }
  },
  components:{
    RouteList,
  },
  mounted () {

  },
  methods: {
    positionBtnClass (value) {
      return (value == this.config.position) ? `btn-light` : `btn-outline-light`
    }
  }
}
</script>

<style scoped lang="sass">
@import "~bootswatch/dist/lux/variables"
@import "~bootstrap/scss/bootstrap"
@import "~bootswatch/dist/lux/bootswatch"

main
  background-color: #1e1e1e
  background-position: top
  background-size: cover
  padding: 1rem 0
  min-height: 100vh
  -webkit-user-select: none
  -moz-user-select: none

h1,h2
  color: white
  display: inline-block
  font-weight: 100
  img
    vertical-align: middle


.config-btn
  font-size: 1.2rem
</style>
