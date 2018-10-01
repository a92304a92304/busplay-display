const geolib = require('geolib')

const options = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0
}

// 取得目前 GPS 方位 (取得一次)
const getPosition = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const crd = pos.coords
      const result = crd

      if(crd.accuracy > 80) reject(result)   // 當精確度過低時 忽略此次取得gps
      else resolve(result)

    }, (e) => {
      reject(e)
    }, options)
  })
}

// 監聽 GPS 是否發生變動
const watchPosition = (success) => {
  const watchId = navigator.geolocation.watchPosition((pos) => {
    const crd = pos.coords
    const result = crd

    if (crd.accuracy > 80) {}
    else success(result)

  }, (e) => {
    alert(JSON.stringify(e))
  }, options)

  return watchId
}


// 取得距離最近的 index
const getNearest = (current, stations) => {
  let resultIndex = null
  let resultDistance = Infinity

  try {
    stations.forEach((val, index) => {
      const thisDistance = calcDistance(...current, ...val)

      if (resultDistance > thisDistance) {
        resultDistance = thisDistance
        resultIndex = index
      }
    })
  } catch (e) {
    return null
  }

  return resultIndex
}

// 計算兩點經緯度的距離
const calcDistance = (lat1, lng1, lat2, lng2) => {
  const result = geolib.getDistance(
    { latitude: lat1, longitude: lng1 },
    { latitude: lat2, longitude: lng2 }
  )
  return result
}

module.exports = {
  getPosition,
  watchPosition,
  calcDistance,
  getNearest,
}
