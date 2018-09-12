// https://developer.mozilla.org/zh-TW/docs/Web/API/Geolocation/watchPosition

const geolib = require('geolib')

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
}

// 取得目前 GPS 方位
const getPosition = () => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const crd = pos.coords
      const img = `https://maps.googleapis.com/maps/api/staticmap?zoom=18&size=800x600&sensor=false&center=${crd.latitude},${crd.longitude}&markers=color:red%7C${crd.latitude},${crd.longitude}`
      crd.img = img
      const result = crd

      resolve(result)
    })
  })
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
  calcDistance,
  getNearest,
}
