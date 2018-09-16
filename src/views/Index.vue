<template lang="pug">
main
  .container
    h1.logo.mt-2
      img.img-fluid.mr-1(src='@/assets/img/logo.svg' style={ height: `3rem` })
      span Busplay
    RouteList.mt-3
</template>

<script>
import RouteList from '@/views/RouteList'

export default {
  name: 'Index',
  data () {
    return {
    }
  },
  components:{
    RouteList,
  },
  mounted () {

  },
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
h1
  color: white
  display: inline-block
  font-weight: 100

</style>
