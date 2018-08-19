<template lang="pug">
main
  #display-area(:style='areaStyle')
    TokyoMetro(ref='TokyoMetro' :ratio='ratio' :data='data' :clock='clock')
  .alert.alert-info.debug-box
    h6.alert-heading.my-0(@click='debugMode=!debugMode') Debug Panel
    div(v-if='debugMode')
      div
      .btn-group.btn-group-sm
        button.btn.btn-primary(@click='setRatio()') 16:9
        button.btn.btn-primary(@click='setRatio(4,3)') 4:3
        button.btn.btn-secondary(@click='enterFullScreen ()') fullscreen
      br
      .btn-group.btn-group-sm
        button.btn.btn-danger(@click='change()') 換站名
        button.btn.btn-secondary(@click='changeDestination()') 換終點站
        button.btn.btn-secondary(@click='toggleTransition()') 換轉場效果
        button.btn.btn-info(onclick="javascript:window.location.reload()") Refresh
</template>

<script>
import $ from 'jquery'

import screenfull from 'screenfull'
import firebase from 'firebase/app'
import TokyoMetro from '@/components/Layout/TokyoMetro'
import ScrollText from '@/components/Layout/ScrollText'

// 雙向綁定參考 https://div.io/topic/1880

export default {
  name: 'Display',
  data () {
    return {
      windowWidth: 0,      // 視窗寬度
      windowHeight: 0,     // 視窗高度
      width: 0,            // 實際顯示屏區域寬度
      height: 0,           // 實際顯示屏區域高度
      ratio: [16, 9],      // 顯示比例
      htmlFontSize: 16,    // 整體字級
      debugMode: true,     // 是否顯示debug panel
      clock: {
        time: '00:00',
        weather: null,
      },
      data: {
        "busName" : "299",
        "color": "#ffc107",
        "destination" : {
          "from" : {
            "ch": "永春高中", "en": "Yongchun High School"
          },
          "to" :{
            "ch": "輔仁大學", "en": "Fu Jen University"
          }
        },
        "thisStop" : {
          "ch" : "臺北科技大學(忠孝)",
          "en" : "National Taipei U. of Technology(Zhongxiao)",
          "jp" : "台北科技大学",
          "kr" : "타이베이과학기술대학",
          "sp" : "Universidad Nacional de Tecnología de Taipei"
        },
        "nextStop" : ['正義郵局','臺北科技大學(忠孝)','忠孝國小','華山文創園區','捷運善導寺站','臺北車站(忠孝)', '中華路口'],
        "nextStop_en" : ['Zhengyi Post Office','National Taipei U. of Technology　(Zhongxiao)','Zhongxiao Elementary School','Huashan Cultural and Creative Industries Park','MRT Shandao Temple Sta.','Taipei Main Sta. (Zhongxiao)', 'Zhonghua Rd. Entrance'],
      },
    }
  },
  components: {
    TokyoMetro,
    ScrollText,
  },
  // 元素已掛載時
  mounted () {
    const vm = this
    vm.setWindow()
    vm.setTime()
    vm.fetchWeather()

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
    // 設定當前時間
    setTime () {
      const date = new Date()
      const h = (date.getHours() > 9) ? date.getHours() : `0${date.getHours()}`
      const m = (date.getMinutes() > 9) ? date.getMinutes() : `0${date.getMinutes()}`
      const s = (date.getSeconds() > 9) ? date.getSeconds() : `0${date.getSeconds()}`
      this.clock.time = (date.getSeconds() % 2 == 0) ? `${h}:${m}` : `${h} ${m}`
      setTimeout(this.setTime, 1000)
    },
    // 從api取得天氣物件
    fetchWeather () {
      const vm = this
      const url = 'https://works.ioa.tw/weather/api/weathers/5.json'

      $.get(url, (data) => {
        vm.clock.weather = data
      })

      setTimeout(this.fetchWeather, 1000 * 60 * 10)
    },
    // 從server取得資料
    fetch () {
      const vm = this
      const config = {
        apiKey: 'AIzaSyARNYqZn9Xp_qxrk5N3WQcb5BGYh9KlN_M',
        authDomain: 'csie-busplay.firebaseapp.com',
        databaseURL: 'https://csie-busplay.firebaseio.com',
        projectId: 'csie-busplay',
        storageBucket: 'csie-busplay.appspot.com',
        messagingSenderId: '542184006096'
      }
      firebase.initializeApp(config)
      firebase.database().ref('/').on('value', (snapshot) => {
        vm.data = snapshot.val()
      })
    },
    change () {
      this.data = {
        "busName" : "忠孝幹線",
        "color": null,
        "destination" : {
          "from" : {
            "ch": "宏國德霖科技大學 的美以經的低演？時為能小香對，以子過跑是同早如家電眼一錢說度大我公經三我球行可上我大同長型流麼們覺為少不年代麼可手成手外真……往後再查",
            "en": "Hungkuo DeLin University of Technology"
          },
          "to" :{
            "ch": "民生社區",
            "en": "Minsheng Community"
          }
        },
        "thisStop" : {
          "ch" : "民生社區活動中心",
          "en" : "Minsheng Activity Center",
          "jp" : "民生コミュニティセンター",
          "kr" : "민생활동센터"
        },
        "nextStop" : ['忠孝國小','臺北科技大學(忠孝)','正義郵局','懷生國中','懷生國中懷生國中懷生國中','捷運國父紀念館站(忠孝)', '捷運國父紀國父紀國父紀國父紀念念念館站(忠孝)'],
        "nextStop_en" : ['Zhengyi Post Office','National Taipei U. of Technology　(Zhongxiao)','Zhongxiao Elementary School','Huashan Cultural and Creative Industries Park','MRT Shandao Temple Sta.','Taipei Main Sta. (Zhongxiao)', 'Zhonghua Rd. Entrance'],
      }
    },
    changeDestination () {
      this.data.destination = {
        "from" : { "ch": "永春高中", "en": "Yongchun High School" },
        "to" :{ "ch": "輔仁大學", "en": "Fu Jen University" }
      }
    },
    // 切換過場動畫
    toggleTransition () {
      this.$refs.TokyoMetro.toggleTransition()
    }
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
</script>

<style scoped lang="sass">
@import "~bootstrap/scss/functions"
@import "~bootstrap/scss/variables"
@import "~bootstrap/scss/mixins"

main
  display: flex
  justify-content: center
  align-items: center
  width: 100%

#display-area
  overflow: hidden
  border: 1px solid $gray-300

.test
  border: 1px solid $gray-300
  width: 50%
</style>
