// 混入
import $ from 'jquery'
import screenfull from 'screenfull'

const display = {
  data () {
    return {
      windowWidth: 0,      // 視窗寬度
      windowHeight: 0,     // 視窗高度
      width: 0,            // 實際顯示屏區域寬度
      height: 0,           // 實際顯示屏區域高度
      htmlFontSize: 16,    // 整體字級
      debugMode: false,    // 是否顯示debug panel
      ratio: [16, 9],      // 顯示比例
      route: null,         // 原始路線資料
      data: null,          // 處理過後 要傳給顯示屏的資料
      marquee: null,       // 跑馬燈內容
      clock: {
        time: '00:00',
        weather: null,
      },
    }
  },
  methods: {
    // 設定視窗寬高
    setWindow () {
      const vm = this
      this.windowWidth = $(window).width()      // 設定 視窗寬度
      this.windowHeight = $(window).height()    // 設定 視窗高度

      this.setWidthHeight()                     // 設定顯示屏寬高

      $(window).resize(() => {    // 當視窗大小變動時
        vm.setWindow()
      })
    },
    // 設定顯示區寬高
    setWidthHeight () {
      const ratioWidth = this.ratio[0]   // 比例：寛
      const ratioHeight = this.ratio[1]  // 比例：高
      const width = (this.windowHeight / ratioHeight) * ratioWidth
      const height = (this.windowWidth / ratioWidth) * ratioHeight

      if(width > this.windowWidth){
        this.width = this.windowWidth
        this.height = height
      }else {
        this.width = width
        this.height = this.windowHeight
      }

      this.htmlFontSize = this.width * 0.02

      $('html').css('font-size', this.htmlFontSize)
    },
    // 進入全螢幕模式
    enterFullScreen () {
      const elem = document.getElementById('main')
      if (screenfull.enabled) {
        screenfull.request(elem)
      }
    },
    // 設定顯示比例
    setRatio (w = 16, h = 9) {
      this.ratio = [w, h]
      this.setWidthHeight()
    },
  },
  computed: {
    routeId () {
      const id = this.$route.params.id
      return (id === `demo`) ? id : parseInt(id)
    },
    areaStyle () {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
      }
    },
    // 行駛方向 預設為`去程`
    direction () {
      return this.$route.query.direction || `go`
    },
    positionOrigin () {
      return this.$route.query.position || `gps`
    },
    enableSimulator () {
      return (this.positionOrigin === `simulator`)
    }
  },
  beforeDestroy () {
    this.stopGps()
    $(window).unbind()
  }
}

export { display }
