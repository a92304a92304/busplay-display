<template lang="pug">
#tokyo-metro(ref='tokyoMetro')
  //- 上方區塊
  #top(ref='top' :style='topStyle')
    template(v-if='data')
      .bus-info
        .bus-name
          h2(:style='busNameStyle') {{ data.routeName }}
        .destination
          ScrollText(ref='destination')
            span.from {{ data.departureName.ch }}
            fa(icon='angle-right' style={margin: `0 .5rem`})
            span.to {{ data.destinationName.ch }}
        .clock
          .item.weather(v-if='clock.weather')
            img.icon(:src='getWeatherIcon(clock.weather.desc)')
            span.text {{ clock.weather.temperature }}°C
          .item.time
            | {{clock.time}}
      .main-station
        .box(ref='mainStationBox')
          transition-group(:name='transitions[transition]')
            h1(:ref='`mainStationText${key}`', :key='key', :class='key', v-for='(stop, key) in data.thisStop' v-show='getAllLangs(data.thisStop)[lang] == key')
              span(:style='getMainStationTextStyle(key)') {{ stop }}
      .ticket-info(hidden)
        span
          fa(icon='arrow-up')
          |  上車收票
    template(v-else)

  //- 下方區塊
  #bottom
    template(v-if='data')
      .route
        .bar(:style='routeBarStyle')
          .arrow(:style='routeBarArrowStyle')
          span.text(:style='fontColorStyle') 分
        ul.stations
          li(v-for='i in 7' :class='{passed: i == 1}')
            .name(:class='{latin: test}' v-if='test')
              span {{ data.nextStop_en[i-1] }}
            .name(v-else)
              span {{ data.stations[i - 1].ch }}
            .time
              span.text {{ i * 2 }}
              span.arrow(v-if='i==1' :class='{active: 1}')
                .shape-arrow-left
            .info
              ul
                li transfer information
    template(v-else)
      .logo-banner
        img.logo(src='@/assets/img/logo-dark.svg')

  .marquee
    ScrollText(ref='marquee' background-color='#1e1e1e' :marquee='true' :start-delay='0')
      | {{ lipsum }}
</template>

<script>
// NOTE: 使用mixins混入重複使用的變數或方法
// TODO: 寫用來判斷一物件內有哪些語言 回傳語言總數等

import colorDetector from '@/assets/js/colorDetector.js'
import ScrollText from '@/components/Layout/ScrollText'
import $ from 'jquery'

export default {
  name: 'TokyoMetro',
  data () {
    return {
      lang: 0,
      routeBarTop: 0,
      destinationBoxStyle: {},
      destinationBoxOffset: 0,
      transitions: ['flipDown', 'scrollDown', 'fade', ''],
      transition: 0,
      mainStationTimer: null,
      lipsum: null,
      test: 0,
    }
  },
  props:{
    data: {
      type: Object,
      default: null
    },
    clock: {
      type: Object,
      default: null
    },
    ratio: {
      type: Array,
      default: null
    },
  },
  components: {
    ScrollText,
  },
  mounted () {
    const vm = this

    vm.setStyle()
    vm.resetMainStationLang()

    $(window).resize(() => {
      vm.setStyle()
    })

    $.ajax({
      url: 'http://more.handlino.com/sentences.json',
      dataType: 'jsonp',
      success: (data) => vm.lipsum = data.sentences[0]
    })
},
  methods: {
    // 切換主要站名語言
    toggleMainStationLang () {
      if(!this.data) return 0
      const LENGTH = this.getAllLangs(this.data.thisStop).length    // 總語言數量
      this.lang = ((this.lang + 1) + LENGTH) % LENGTH
    },
    // 切換轉場效果
    toggleTransition () {
      const LENGTH = this.transitions.length
      this.transition = ((this.transition + 1) + LENGTH) % LENGTH
    },
    // 取得主要站名 h1>span 的style
    getMainStationTextStyle (lang) {
      const vm = this
      const textWidth = $(`#top .main-station .box h1.${lang}`).width()  // 文字實際寬度
      const boxWidth = $('#top .main-station .box').width()              // 框寬度

      const transformValue = (textWidth > boxWidth) ? boxWidth / textWidth : 1
      return { transform: `scaleX(${transformValue})` }
    },
    // 取得天氣圖片路徑
    getWeatherIcon(text) {
      const path = '/img/weather-icon/'
      if(text.indexOf('多雲')>-1) return `${path}cloudy-1.svg`
      if(text.indexOf('晴')>-1) return `${path}sun.svg`
      if(text.indexOf('雷')>-1) return `${path}storm.svg`
      if(text.indexOf('雨')>-1) return `${path}rain.svg`
    },
    // 取得物件內所有語言。回傳 ['ch', 'en', ...]
    getAllLangs (obj) {
      return Object.keys(obj)
    },
    //　根據背景顏色取得字體顏色
    getFontColorByBg (color) {
      return (colorDetector(color) == 'light') ? '#1e1e1e' : '#000'
    },
    // 設定各個元件的style數值
    setStyle () {
      const vm = this
      const $routeTime = $('#tokyo-metro #bottom .route .time')
      const $routeBar = $('#tokyo-metro #bottom .route .bar')

      if($routeTime.position())
        vm.routeBarTop = $routeTime.position().top - ($routeBar.height() - $routeTime.height()) / 2
    },
    resetMainStationLang () {
      const vm = this

      clearInterval(this.mainStationTimer)
      this.lang = 0
      this.mainStationTimer = setInterval(() => {
        vm.toggleMainStationLang()
      }, 3000)
    }
  },
  computed: {
    topStyle () {
      const h = (this.ratio[0] == 4 && this.ratio[1] == 3) ? '35%' : '35%'
      const color = (this.data) ? this.data.color : ''
      return {
        borderColor: color,
        height: `${h}`,
      }
    },
    busNameStyle () {
      let color = (this.data) ? this.data.color : ''
      let reversedColor
      try{ reversedColor = this.getFontColorByBg(color) }
      catch(e){ reversedColor = '#1e1e1e' }
      return {
        background: color,
        color: reversedColor,
      }
    },
    fontColorStyle () {
      let reversedColor
      try{ reversedColor = this.getFontColorByBg(this.data.color) }
      catch(e){ reversedColor = '#fff' }
      return { color: reversedColor }
    },
    routeBarStyle () {
      return {
        top: `${this.routeBarTop}px`,
        backgroundColor: this.data.color
      }
    },
    routeBarArrowStyle () {
      let color = (this.data.color) ? this.data.color : '#1e1e1e'
      return { borderColor: `transparent transparent transparent ${color}` }
    }
  },
  watch: {
    data () {
      if(this.$refs.destination) this.$refs.destination.reset()
      this.resetMainStationLang()
    }
  },
  updated () {
    this.$nextTick(() => this.setStyle())
  }
}
</script>

<style scoped lang="sass">
// BS之變數
@import "~bootstrap/scss/functions"
@import "~bootstrap/scss/variables"
@import "~bootstrap/scss/mixins"

// 過場動畫
@import "../../assets/css/style"
@import "../../assets/css/animation"

// TokyoMetro
@import "../../assets/css/Layout/tokyoMetro"
</style>
