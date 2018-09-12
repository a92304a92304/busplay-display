<!--
# 文字滾動器

## 用法(pug)
```
ScrollText(:px-per-sec='200' :start-delay='1' :end-delay='1')
  div Your Element Here
```

## 參數
- px-per-sec: 每秒滾動多少px
- start-delay: 開始滾動前等待的秒數
- end-delay: 結束滾動後等待的秒數
- noScrollDelay: 當不需要滾動時，等待的秒數
- text-style: 內容字體樣式
- marquee: 是否滾動直到文字全部消失於畫面中
- forceScroll: 是否即使文字不夠長仍然滾動
-->
<template lang="pug">
.box(ref='box' @click='reset()')
  .gradient-left(:class='{scrolling: (state == 1 || state == 2)}' :style='getGradientStyle()')
  .gradient-right(:class='{scrolling: (state == 0 || state == 1)}' :style='getGradientStyle(`right`)')
  .content(ref='content' :style='contentStyle')
    span(:style='textStyle')
      slot
</template>

<script>
import _ from 'lodash'

export default {
  name: 'ScrollText',
  data () {
    return {
      innerText: null,
      offset: 0,
      state: 0,    // 0: 滾動前, 1: 滾動中, 2: 結束滾動, 3: 不滾動
      startTimer: null,
      scrollingTimer: null,
      endTimer: null,
    }
  },
  props:{
    pxPerSec: {
      type: Number,
      default: 100,
    },
    startDelay: {
      type: Number,
      default: 3,
    },
    endDelay: {
      type: Number,
      default: 10,
    },
    noScrollDelay: {
      type: Number,
      default: 5,
    },
    backgroundColor: {
      type: String,
      default: '#f2f2f2',
    },
    textStyle: {
      type: Object,
      default: () => { return {} }
    },
    marquee: {
      type: Boolean,
      default: false
    },
    forceScroll: {
      type: Boolean,
      default: false
    },
  },
  mounted () {
    this.start()
  },
  methods: {
    // 準備開始滾動
    start () {
      const offset = this.calcOffset()
      this.offset = 0
      this.state = 0

      if(this.calcOffset() <= 0 && !this.forceScroll){
        this.state = 3  // 若字數未超過則不播放滾動動畫
        this.endTimer = setTimeout(() => {
          this.$emit('end')
        }, this.noScrollDelay * 1000)
      } else {
        if(this.marquee) this.offset = -this.$refs.box.getBoundingClientRect().width
        this.startTimer = setTimeout(this.scrolling, this.startDelay * 1000)
      }
    },
    // 滾動中
    scrolling () {
      const boxWidth = this.$refs.box.getBoundingClientRect().width
      const offset = this.calcOffset()
      this.state = 1
      this.offset = (offset > 0) ? offset : 0

      if(this.marquee) this.offset = offset + boxWidth

      const duration = this.offset / this.pxPerSec  // 動畫持續的秒數
      this.scrollingTimer = setTimeout(this.end, duration * 1000)
    },
    // 滾動完後等待
    end () {
      this.state = 2
      this.endTimer = setTimeout(() => {
        this.$emit('end')
        this.start()
      }, this.endDelay * 1000)
    },
    // 根據長度計算offset
    calcOffset () {
      if(!(this.$refs.box && this.$refs.content)) return 0

      const boxWidth = this.$refs.box.getBoundingClientRect().width
      const textWidth = this.$refs.content.getBoundingClientRect().width
      const offset = textWidth - boxWidth
      return offset
    },
    // 重設文字滾動器，文字歸位並從頭開始
    reset () {
      this.offset = 0
      this.state = 0
      clearInterval(this.startTimer)
      clearInterval(this.scrollingTimer)
      clearInterval(this.endTimer)
      this.start()
    },
    hexToRgb (hex) {
      let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
      hex = hex.replace(shorthandRegex, (m, r, g, b) => {
        return r + r + g + g + b + b
      })
      let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      } : null
    },
    // 取得漸層style
    getGradientStyle (direction = 'left') {
      const hexToRgb = this.hexToRgb
      const color = this.backgroundColor
      const colorRGB = `${hexToRgb(color).r}, ${hexToRgb(color).g}, ${hexToRgb(color).b}`

      return {
        background: `linear-gradient(to ${direction}, rgba(${colorRGB}, 0), rgba(${colorRGB}, 1) 100%)`,
      }
    }
  },
  computed: {
    contentStyle () {
      const duration = this.offset / this.pxPerSec  // 動畫持續的秒數
      const distance = -this.offset

      return {
        transition: `transform ${duration}s linear`,
        transform: `translateX(${distance}px)`,
      }
    },
  },
  watch: {
    innerText () {
      this.reset()
    }
  },
  updated () {
    try{
      this.innerText = (this.$refs.content.outerText)
    }
    catch(e){
      this.innerText = ''
    }
  },
  beforeDestroy() {
    clearInterval(this.startTimer)
    clearInterval(this.scrollingTimer)
    clearInterval(this.endTimer)
  }
}
</script>

<style scoped lang="sass">
.box
  position: relative
  width: 100%
  overflow: hidden

.content
  display: inline-block
  white-space: nowrap
  transition: transform 2s

.gradient-left, .gradient-right
  position: absolute
  bottom: 0
  width: 1rem
  height: 100%
  z-index: 9999
  transition: opacity .3s
  opacity: 0
  &.scrolling
    opacity: 1

.gradient-left
  left: 0
  background: linear-gradient(to left, rgba(#f2f2f2, 0), rgba(#f2f2f2, 1) 100%)
.gradient-right
  right: 0
  background: linear-gradient(to right, rgba(#f2f2f2, 0), rgba(#f2f2f2, 1) 100%)

</style>
