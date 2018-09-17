const $ = require('jquery')
const gps = require('./gps')
const demoRoute = require('./demoRoute')

const distanceOffset = 50

const fetchRoute = (id, direction = `go`) => {
  if (id === `demo`)
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, demoRoute.route)
      
      data.stations = data.stations[direction] || []  // 取返程或去程

      initNewRoute(data).then(() => {
        initNewRoute(data)
        resolve(data)
      })
    })
  else
    return new Promise((resolve, reject) => {
      const url = `https://busplay-server.herokuapp.com/OneRouteXQ/${id}`
      $.ajax({
        url,
        type: 'GET',
        dataType: 'json',
        success: data => {
          data.stations = data.stations[direction] || []  // 取返程或去程

          initNewRoute(data).then(() => {
            initNewRoute(data)
            resolve(data)
            console.log(data)
          })
        },
        error: e => reject(e),
      })
    })
}

// 處理新建立的路線(初始化)
const initNewRoute = (data) => {
  return new Promise((resolve, reject) => {
    const stations = data.stations

    // 為每一站標註為尚未經過
    stations.forEach((station) => {
      station.passed = false          // station 為obj所以可以直接賦值
    })

    //  取得目前位置
    gps.getPosition().then((position) => {
      const thisPosition = [position.latitude, position.longitude]   // 當前位置
      const stationsForCalc = []                                // 路線位置list

      data.stations.forEach((val) => {
        stationsForCalc.push([parseFloat(val.location.lat), parseFloat(val.location.lng)])
      })

      const nextIndex = gps.getNearest([position.latitude, position.longitude], stationsForCalc)
      const nextMinDistance = gps.calcDistance(...thisPosition, ...stationsForCalc[nextIndex])

      // if (nextIndex - 1 >= 0)
      const prevIndex = nextIndex - 1
      const prevDistance = gps.calcDistance(...thisPosition, ...stationsForCalc[prevIndex])

      // 初始化下一站的附加資訊
      data.current = {
        nextIndex,            // 下一站之 index
        nextMinDistance,      // 距離下一站之最小距離
        prevIndex,
        prevDistance,
      }
      resolve(data)
    })
  })
}

// 在每次取得gps時觸發
const setCurrent = (data, position) => {
  return new Promise((resolve, reject) => {
    const thisPosition = [position.latitude, position.longitude]   // 當前位置
    const stationsForCalc = []                                // 路線位置list

    data.stations.forEach((val) => {
      stationsForCalc.push([parseFloat(val.location.lat), parseFloat(val.location.lng)])
    })

    const nextIndex = data.current.nextIndex
    const nextMinDistance = data.current.nextMinDistance
    const nextNewDistance = gps.calcDistance(...thisPosition, ...stationsForCalc[nextIndex])

    if (nextNewDistance <= nextMinDistance + distanceOffset) {
      // 正在接近下一站: 更新`與下一站的最小距離`
      data.current.nextMinDistance = nextNewDistance
    } else {
      // 已遠離下一站: 設定該站為passed, `下一站index`++, 重設`與下一站的最小距離`
      if (data.current.nextIndex + 1 < stationsForCalc.length) {
        data.stations[nextIndex].passed = true
        data.current.nextIndex++
        data.current.nextMinDistance = gps.calcDistance(...thisPosition, ...stationsForCalc[data.current.nextIndex])
      } else {
        // 已超越終點站
      }
    }
    data.current.prevIndex = data.current.nextIndex - 1
    data.current.prevDistance = gps.calcDistance(...thisPosition, ...stationsForCalc[data.current.prevIndex])

    resolve(data)
  })
}

export default {
  fetchRoute,
  initNewRoute,
  setCurrent,
}
