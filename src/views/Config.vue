<template lang="pug">
main
  .container
    h1.text-light
      router-link.text-light.mr-4(to='/') #[fa(icon='chevron-left')]
      span Configuration
</template>

<script>


export default {
  name: 'Config',
  data () {
    return {
    }
  },
  components:{
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
  padding: 2rem 0
  min-height: 100vh
  -webkit-user-select: none
  -moz-user-select: none

h1
  color: white
  display: inline-block
  font-weight: 100


</style>
