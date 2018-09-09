<template lang="pug">
#login
  .text-center
    h1
      img.img-fluid(src='@/assets/img/logo.svg' style={height: `5rem`})
      span Busplay
  form(@submit.prevent='Login(username, password)')
    .form-group
      label Username
      input.form-control(type='text' v-model='username' placeholder='用戶名' required)
    .form-group
      label Password
      input.form-control(type='password' v-model='password' placeholder='密碼' required)
    button.btn.btn-primary.btn-block.mb-3(type='submit') Login
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      username: 'admin',
      password: 'a',
      auth: true,
    }
  },
  mounted () {
    this.checkAuth()
  },
  methods: {
    // 登入
    login (username, password) {
      alert(`按下登入(${username}, ${password})`)
    },
    // 檢查登入狀態
    checkAuth () {

    }
  }
}
</script>

<style scoped lang="sass">
@import "~bootswatch/dist/lux/variables"
@import "~bootstrap/scss/bootstrap"
@import "~bootswatch/dist/lux/bootswatch"

#login
  background-color: rgba(black, .8)
  padding: 1rem 2rem

h1, h2, label
  color: white

h1
  font-size: 3rem
  font-family: 'arial'

h2
  font-size: 1.5rem
</style>
