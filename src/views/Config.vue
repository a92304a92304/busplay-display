<template lang="pug">
main
  .container
    h1.text-light.mb-4
      router-link.text-light.mr-4(to='/') #[fa(icon='chevron-left')]
      span Configuration
    .col-12
      h2 位置取得
    .col-12
      .btn-group
        button.btn.btn-secondary(:class='positionBtnClass(`gps`)' @click='config.position = `gps`') 裝置 GPS
        button.btn.btn-secondary(:class='positionBtnClass(`simulator`)'  @click='config.position = `simulator`') 行車模擬器
</template>

<script>


export default {
  name: 'Config',
  data () {
    return {
    }
  },
  props: {
    config: {
      type: Object,
      default: { position: `gps` }
    },
  },
  components:{
  },
  methods: {
    positionBtnClass (value) {
      return (value == this.config.position) ? `btn-light` : `btn-outline-light`
    }
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

h1, h2
  color: white
  display: inline-block
  font-weight: 100


</style>
