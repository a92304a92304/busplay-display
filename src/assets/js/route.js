const $ = require('jquery')
const gps = require('./gps')
const demoRoute = require('./demoRoute')

const distanceOffset = 30   // 移動距離大於此值才算數
const meterPerMin = 300     // 估計每分鐘行駛的公尺數


const fetchRoute = (id, direction = `go`, position = null) => {
  if (id === `demo`)
    return new Promise((resolve, reject) => {
      const data = Object.assign({}, demoRoute.route)

      initNewRoute(data, direction, position).then(() => {
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
          initNewRoute(data, direction, position).then(() => {
            resolve(data)
            console.log(data)
          })
        },
        error: e => reject(e),
      })
    })
}

// 處理新建立的路線(初始化)
const initNewRoute = (data, direction = `go`, position = null) => {
  data.stations = data.stations[direction] || []  // 取返程或去程之路線資料

  if (direction === `back`)   // 若為返程，交換起訖站名
    [data.departureName, data.destinationName] = [data.destinationName, data.departureName] // 以解構交換

  return new Promise((resolve, reject) => {
    const stations = data.stations

    // 為每一站標註為尚未經過
    stations.forEach((station) => {
      station.passed = false          // station 為obj所以可以直接賦值
    })

    // 處理新路線
    const thisPosition = [position.latitude, position.longitude]   // 當前位置
    const stationsForCalc = []                                // 路線位置list

    data.stations.forEach((val) => {
      stationsForCalc.push([parseFloat(val.location.lat), parseFloat(val.location.lng)])
    })

    const nextIndex = gps.getNearest([position.latitude, position.longitude], stationsForCalc)
    const nextMinDistance = gps.calcDistance(...thisPosition, ...stationsForCalc[nextIndex])


    const prevIndex = (nextIndex - 1 >= 0) ? (nextIndex - 1) : null
    const prevDistance = (prevIndex)
      ? gps.calcDistance(...thisPosition, ...stationsForCalc[prevIndex])
      : null


    // 初始化下一站的附加資訊
    data.current = {
      nextIndex,            // 下一站之 index
      nextMinDistance,      // 距離下一站之最小距離
      prevIndex,
      prevDistance,
    }
    resolve(data)

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

    if (nextNewDistance <= nextMinDistance + distanceOffset) {  // 新下站距 <= 原最小下站距 + 偏移量
      // 正在接近下一站: 更新`與下一站的最小距離`
      if (nextMinDistance - nextNewDistance > distanceOffset) {
        data.current.nextMinDistance = nextNewDistance
        data.current.prevIndex = data.current.nextIndex - 1
        data.current.prevDistance = gps.calcDistance(...thisPosition, ...stationsForCalc[data.current.prevIndex])
      }

    } else {
      // 已遠離下一站: 設定該站為passed, `下一站index`++, 重設`與下一站的最小距離`
      if (data.current.nextIndex + 1 < stationsForCalc.length) {
        data.stations[nextIndex].passed = true
        data.current.nextIndex++

        data.current.nextMinDistance = gps.calcDistance(...thisPosition, ...stationsForCalc[data.current.nextIndex])
        data.current.prevIndex = data.current.nextIndex - 1
        data.current.prevDistance = gps.calcDistance(...thisPosition, ...stationsForCalc[data.current.prevIndex])
      } else {
        // 已超越終點站
      }
    }

    resolve(data)
  })
}

// 計算預估的行駛時間
const calcEstTime = (route) => {
  const current = route.current
  const stations = route.stations

  const nextIndex = current.nextIndex
  const nextDistance = current.nextMinDistance

  // 預估出各站距離下一站的到站時間 (若已經過則為0)
  const timeList = stations.map((station, index) => {
    let min = 0
    if (index === nextIndex) {  // 本站
      min = (nextDistance / meterPerMin)
    } else if (index === stations.length - 1) {   // 最終站
      min = 0
    } else if (index >= nextIndex) {  // 其他下一站
      min = (station.distance / meterPerMin)
    }
    return min
  })

  // 將陣列內的值和前一個值相加
  timeList.forEach((time, index, list) => {
    const prev = (index !== 0 ) ? list[index - 1] : 0
    list[index] = prev + time
  })

  // 將陣列內的值無條件進位
  timeList.forEach((time, index, list) => list[index] = Math.ceil(time))

  return timeList
}


export default {
  fetchRoute,
  initNewRoute,
  setCurrent,
  calcEstTime,
}
