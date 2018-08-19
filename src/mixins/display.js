// 混入
import $ from 'jquery'

const display = {
  data () {
    return {
      windowWidth: 0,      // 視窗寬度
      windowHeight: 0,     // 視窗高度
      width: 0,            // 實際顯示屏區域寬度
      height: 0,           // 實際顯示屏區域高度
      htmlFontSize: 16,    // 整體字級
      debugMode: false,     // 是否顯示debug panel
      ratio: [16, 9],      // 顯示比例
      route: null,
      data: null,
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
    areaStyle () {
      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
      }
    },
  },
}

export { display }
