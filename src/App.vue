<template lang='pug'>
#app #[router-view]
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="sass">
// RESET CSS
@import "reset-css"

// 自訂樣式(全局)
@import "./assets/css/style"
</style>
