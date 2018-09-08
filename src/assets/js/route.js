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
        resetNewRoute(data).then(() => {
          resolve(data)
          console.log(data)
        })
      },
      error: e => reject(e),
    })
  })
}

// 處理新建立的路線
const resetNewRoute = (data) => {
  return new Promise((resolve, reject) => {
    const stations = data.stations

    // 為每一站標註為尚未經過
    stations.forEach((station) => {
      station.passed = false
    })

    //  取得目前位置
    gps.getPosition().then((position) => {
      const current = [position.latitude, position.longitude]
      const stationsForCalc = []

      data.stations.forEach((val) => {
        stationsForCalc.push([parseFloat(val.location.lat), parseFloat(val.location.lng)])
      })

      const stationIndex = gps.getNearest([position.latitude, position.longitude], stationsForCalc)
      const minDistance = gps.calcDistance(...current, ...stationsForCalc[stationIndex])

      // 初始化下一站的附加資訊
      data.nextDest = {
        stationIndex,     // 站之 index
        minDistance,      // 最小距離
      }

      resolve(data)
    })
  })
}



export default {
  fetchRoute,
}
