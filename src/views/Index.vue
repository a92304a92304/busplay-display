<template lang="pug">
main
  .container
    h1.logo
      img.img-fluid.mr-1(src='@/assets/img/logo.svg' style={height: `3rem`})
      span Busplay
    .row.justify-content-center
      .col-12.col-lg-12
        RouteList.mt-3
</template>

<script>
import Login from '@/views/Login'
import RouteList from '@/views/RouteList'

export default {
  name: 'Index',
  data () {
    return {
    }
  },
  components:{
    Login,
    RouteList,
  },
  mounted () {
  },
  methods: {
  }
}
</script>

<style scoped lang="sass">
@import "~bootswatch/dist/united/variables"
@import "~bootstrap/scss/bootstrap"
@import "~bootswatch/dist/united/bootswatch"
main
  background-color: #1e1e1e
  background-position: top
  background-size: cover
  padding: 1rem 0
  min-height: 100vh
  -webkit-user-select: none
  -moz-user-select: none
h1
  color: white

</style>
