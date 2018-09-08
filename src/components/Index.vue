<template lang="pug">
main
  .container
    .row.justify-content-center
      .col-12.col-lg-6
        Login.mt-5
        .btn-group.btn-group-sm
          router-link.btn.btn-light.mt-3(to='/display') Goto Display
</template>

<script>

import Login from '@/components/Login'

export default {
  name: 'Index',
  data () {
    return {
    }
  },
  components:{
    Login,
  },
  mounted () {
    this.$router.push('/display')
  },
  methods: {
  }
}
</script>

<style scoped lang="sass">
main
  height: 100vh
  background: url('https://c.pxhere.com/photos/8e/91/bus_transportation_people_aisle_shoes_seats-892809.jpg!d')
  background-position: top
  background-size: cover

</style>
