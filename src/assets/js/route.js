import $ from 'jquery'
import gps from './gps'


const fetchRoute = (id) => {
  return new Promise((resolve, reject) => {
    const url = `https://busplay-server.herokuapp.com/OneRouteXQ/${id}`
    $.ajax({
      url,
      type: 'GET',
      dataType: 'json',
      success: data => {
        initNewRoute(data).then(() => {
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
      const current = [position.latitude, position.longitude]   // 當前位置
      const stationsForCalc = []                                // 路線位置list

      data.stations.forEach((val) => {
        stationsForCalc.push([parseFloat(val.location.lat), parseFloat(val.location.lng)])
      })

      const nextStationIndex = gps.getNearest([position.latitude, position.longitude], stationsForCalc)
      const nextMinDistance = gps.calcDistance(...current, ...stationsForCalc[nextStationIndex])

      // 初始化下一站的附加資訊
      data.current = {
        nextStationIndex,     // 站之 index
        nextMinDistance,      // 最小距離
        thisStationIndex: nextStationIndex - 1
      }
      resolve(data)
    })
  })
}

export default {
  fetchRoute,
  initNewRoute,
}
