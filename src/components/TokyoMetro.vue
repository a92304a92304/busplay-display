<template lang="pug">
#tokyo-metro(ref='tokyoMetro')
  //- 上方區塊
  #top(ref='top' :style='topStyle')
    template(v-if='data')
      .bus-info
        .bus-name
          h2(:style='busNameStyle') {{ data.routeName[bottomLangs[bottomLang]] }}
        .destination
          ScrollText(ref='destination' :remPerSec='5' :htmlFontSize='htmlFontSize')
            span.from {{ data.departureName[bottomLangs[bottomLang]] }}
            fa(icon='angle-right' style={ margin: `0 .5rem` })
            span.to {{ data.destinationName[bottomLangs[bottomLang]] }}
        .clock
          .item.weather(v-if='clock.weather')
            img.icon(:src='clock.weather.iconLink')
            span.text {{ parseInt(clock.weather.temperature) }}°C
          .item.time
            span {{clock.time}}
      .main-station
        .box(ref='mainStationBox')
          transition-group(:name='transitions[transition]')
            h1(:ref='`mainStationText${key}`', :key='key', :class='key', v-for='(stop, key) in data.thisStop' v-show='getAllLangs(data.thisStop)[mainStationLang] == key')
              span(:style='getMainStationTextStyle(key)') {{ stop }}
      .ticket-info(hidden)
        span #[fa(icon='arrow-up')] 上車收票

    template(v-else)

  //- 下方區塊
  #bottom
    template(v-if='data')
      .route(v-if='carousel === 0')
        .bar(:style='routeBarStyle')
          .arrow(:style='routeBarArrowStyle')
          span.text(:style='fontColorStyle')
            span.en(v-if='bottomLangs[bottomLang] === `en`') min(s)
            span.ch(v-else) 分
        ul.stations
          li(v-for='i in 7' :class='{passed: i == 1}')
            .name(:class='{ latin: bottomLangs[bottomLang] === `en` }')
              span {{ data.stations[i - 1][bottomLangs[bottomLang]] }}
            .time
              span.text
                span(v-show='i != 1') {{ i }}
              span.arrow(v-if='i==1' :class='{ active: 1 }') #[.shape-arrow-left]
            .info
              ul #[li]

      template(v-else)
        //- 景點
        .spot(v-if='carousels[carousel - 1].type === `spot`')
          h4.headline-enter(:style='{ borderColor: data.color }') 周邊資訊 / Information
          .box
            .row.list
              .col-auto.item(v-for='(i, index) in getCarouselContent(carousel - 1)' :key='index' :style='{ animationDelay: `${0.1 + index * 0.05}s` }')
                .row.align-items-center.no-gutters
                  .col-auto.icon.icon-enter(:style='{ animationDelay: `${index * 0.07}s` }')
                    img(src='@/assets/img/icon/mrt.svg' v-if='i.icon === `mrt`')
                    fa(:icon='i.icon' v-else)
                  .col.text.fade-in-left(:style='{ animationDelay: `${0.1 + index * 0.07}s` }')
                    .ch {{ i.name.ch }}
                    .en {{ i.name.en }}
        //- 廣告(輪播)
        .ad(v-for='(i, index) in carousels' :key='index' v-if='index === carousel - 1 && carousels[carousel - 1].type === `ad`')
          //- 僅圖片的輪播
          .ad-img(v-if='!getCarouselContent(index).title.ch')
            img.fade-in-left(:src='getCarouselContent(index).img')

          //- 有圖片和文字的輪播
          .ad-text(v-else-if='index === carousel - 1')
            h4.fade-in-left(:style='{ borderColor: data.color }') {{ getCarouselContent(index).title.ch }} / {{ getCarouselContent(index).title.en }}
            .content.fade-in-left(style={ animationDelay: `.2s` })
              .row.align-items-center.no-gutters
                .col
                  p.ch(v-html='getCarouselContent(index).content.ch')
                  p.en(v-html='getCarouselContent(index).content.en')
                .col-3.img-enter(v-if='getCarouselContent(index).img')
                  img(:src='getCarouselContent(index).img')

        .carousel-bar(v-if='debugMode == 1')
          .item(v-for='(i, index) in carousels' :class='{ active: index === carousel - 1 }') {{ getCarouselBarText(i) }}

    template(v-else)
      .logo-banner
        img.logo(src='@/assets/img/logo-dark.svg')

  .marquee(v-if='isMarqueeShow')
    ScrollText(ref='marquee' :htmlFontSize='htmlFontSize' background-color='#1e1e1e' :marquee='true' :start-delay='0' :endDelay='10' :forceScroll='true' v-for='(i, index) in marquee' v-if='index === currMarquee' @end='marqueeEnd' :key='index') {{ i }}
</template>

<script>
import colorDetector from '@/assets/js/colorDetector.js'
import ScrollText from '@/components/ScrollText'
import $ from 'jquery'

const mainStationInterval =  4 * 1000   // 主車站更換語言間隔
const bottomInterval      = 10 * 1000   // 底部更換語言間隔
const routeDuration       = 20 * 1000   // 顯示路線的維持時間

export default {
  name: 'TokyoMetro',
  data () {
    return {
      routeBarTop: 0,
      destinationBoxStyle: {},
      destinationBoxOffset: 0,
      transitions: ['flipDown', 'scrollDown', 'fade', ''],
      transition: 0,              // 當前轉場樣式index
      //
      mainStationLang: 0,         // 當前主站名index
      mainStationText: null,      // 暫存主站名字串
      mainStationTimer: null,     // 儲存切換主站名timer id
      //
      bottomLang: 0,              // 當前底部語言index
      bottomLangs: [`ch`, `en`],  // 底部語言列表
      bottomTimer: null,
      //
      currMarquee: 0,
      carousel: 0,
      carouselTimer: null,
    }
  },
  props:{
    data: { type: Object, default: null },
    clock: { type: Object, default: null },
    ratio: { type: Array, default: null },
    marquee: { type: Array, default: null },
    carousels: { type: Array, default: null },
    htmlFontSize: { type: Number, default: 12 },
    debugMode: { type: Number, default: 0 }
  },
  components: {
    ScrollText,
  },
  mounted () {
    const vm = this

    vm.setStyle()
    vm.resetMainStationLang()
    vm.resetBottomLang()

    $(window).resize(() => {
      vm.setStyle()
    })
    vm.setCarousel()
},
  methods: {
    // 切換主要站名語言
    toggleMainStationLang () {
      if(!this.data) return
      const length = this.getAllLangs(this.data.thisStop).length    // 總語言數量
      this.mainStationLang = ((this.mainStationLang + 1) + length) % length
    },
    // 切換底部語言
    toggleBottomLang () {
      if(!this.data) return
      const length = this.bottomLangs.length    // 總語言數量
      this.bottomLang = ((this.bottomLang + 1) + length) % length
    },
    // 切換轉場效果
    toggleTransition () {
      const length = this.transitions.length
      this.transition = ((this.transition + 1) + length) % length
    },
    // 取得主要站名 h1>span 的style
    getMainStationTextStyle (lang) {
      const vm = this
      const textWidth = $(`#top .main-station .box h1.${lang}`).width()  // 文字實際寬度
      const boxWidth = $('#top .main-station .box').width()              // 框寬度

      const transformValue = (textWidth > boxWidth) ? boxWidth / textWidth : 1
      return { transform: `scaleX(${transformValue})` }
    },
    // 取得物件內所有語言。回傳 ['ch', 'en', ...]
    getAllLangs (obj) {
      if(typeof obj !== 'object') return []
      return Object.keys(obj)
    },
    //　根據背景顏色取得字體顏色
    getFontColorByBg (color) {
      return (colorDetector(color) === 'light') ? '#1e1e1e' : '#fff'
    },
    // 設定各個元件的style數值
    setStyle () {
      const vm = this
      const $routeTime = $('#tokyo-metro #bottom .route .time')
      const $routeBar = $('#tokyo-metro #bottom .route .bar')

      if($routeTime.position())
        vm.routeBarTop = $routeTime.position().top - ($routeBar.height() - $routeTime.height()) / 2
    },
    // 重置主車站語言
    resetMainStationLang () {
      const vm = this

      clearInterval(this.mainStationTimer)
      this.mainStationLang = 0
      this.mainStationTimer = setInterval(() => {
        vm.toggleMainStationLang()
      }, mainStationInterval)
    },
    resetBottomLang () {
      const vm = this

      clearInterval(this.bottomTimer)
      this.bottomLang = 0
      this.bottomTimer = setInterval(() => {
        vm.toggleBottomLang()
      }, bottomInterval)
    },
    // 當一條跑馬燈文字滾完後觸發，換到下一條文字
    marqueeEnd () {
      const length = this.marquee.length
      this.currMarquee = ((this.currMarquee + 1) + length) % length
    },
    // 取得第 n 個輪播的內容
    getCarouselContent (index) {
      try {
        return (index <= this.carousels.length) ? this.carousels[index].content : []
      } catch (e) {
        return []
      }
    },
    toggleCarousel () {
      const length = this.carousels.length  // 輪播訊息總數量
      try {
        this.carousel = ((this.carousel + 1) + (length + 1)) % (length + 1) // 切換到下一則輪播訊息
      }
      catch(e){
        this.carousel = 0
      }
    },
    setCarousel () {
      const vm = this
      const length = vm.carousels.length  // 輪播訊息總數量
      let duration = 5000

      if (length === 0) {   // 若無輪播訊息
        vm.carousel = 0     // 將當前輪播訊息設定為 0，即預設值顯示路線
      } else {
        vm.toggleCarousel()             // 切換輪播訊息
        duration = (vm.carousel == 0)   // 播放的持續時間，若本則訊息為`路線`:
          ? routeDuration   // 設為路線畫面固定的持續時間
          : vm.carousels[vm.carousel - 1].duration  // 設為各則訊息的持續時間
          || 5000   // 取得 duration 失敗時的預設值
      }
      vm.carouselTimer = setTimeout(() => vm.setCarousel(), duration)   // 在 duration 後重複執行
    },
    getCarouselBarText (obj) {
      if (obj.type === `spot`) return `spot`
      else if (!obj.content.content.ch) return `圖`
      return `ad`
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
      const color = (this.data.color) ? this.data.color : '#1e1e1e'
      return { borderColor: `transparent transparent transparent ${color}` }
    },
    isMarqueeShow () {
      return this.marquee && this.marquee.length > 0
    },
    carouselContentText () {
      return JSON.stringify(this.carousels)
    }
  },
  watch: {
    data () {
      if(this.destination !== this.data.stations[0].ch) { // 當文字發生變化時，重設main station動畫
        this.destination = this.data.stations[0].ch
        this.resetMainStationLang()
      }
    },
    carouselContentText () {  // 偵測到當輪播列表發生變動時，從頭開始播放
      clearInterval(this.carouselTimer)
      this.carousel = 0
      this.carouselTimer = setTimeout(() => this.setCarousel(), 7000)
    }
  },
  updated () {
    this.$nextTick(() => this.setStyle())
  },
  beforeDestroy () {
    clearInterval(this.mainStationTimer)
    clearInterval(this.bottomTimer)
    clearInterval(this.carouselTimer)
  }
}
</script>

<style scoped lang="sass">
// BS之變數
@import "~bootstrap/scss/functions"
@import "~bootstrap/scss/variables"
@import "~bootstrap/scss/mixins"

// 過場動畫
@import "../assets/css/style"
@import "../assets/css/animation"

// TokyoMetro
@import "../assets/css/tokyoMetro"
</style>
