// https://developer.mozilla.org/zh-TW/docs/Web/API/Geolocation/watchPosition

let id = null

const options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
}

const start = (success, error) => {
  if(id !== null) return

  id = navigator.geolocation.watchPosition((pos) => {
    const crd = pos.coords
    const img = `https://maps.googleapis.com/maps/api/staticmap?zoom=17&size=800x600&sensor=false&center=${crd.latitude},${crd.longitude}&markers=color:red%7C${crd.latitude},${crd.longitude}`
    const result = { img, crd }
    success(result)
  }, (e) => {
    error(e.message)
  }, options)
}

const stop = () => {
  if(id) {
    navigator.geolocation.clearWatch(id)
    id = null
  }
}

const getNearest = (current, stations) => {

  let resultIndex = null
  let resultDistance = Infinity

  stations.forEach((val, index) => {
    const thisDistance = calcDistance(...current, ...val)

    if (resultDistance > thisDistance) {
      resultDistance = thisDistance
      resultIndex = index
    }
  })
  return resultIndex
}


// 計算兩點經緯度的距離
const calcDistance = (lat1, lng1, lat2, lng2) => {
  const radLat1 = lat1 * Math.PI / 180.0
  const radLat2 = lat2 * Math.PI / 180.0
  const a = radLat1 - radLat2
  const b = lng1 * Math.PI / 180.0 - lng2 * Math.PI / 180.0
  let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a/2),2) +
        Math.cos(radLat1)*Math.cos(radLat2)*Math.pow(Math.sin(b/2),2)))
  s = s * 6378.137
  s = Math.round(s * 10000) / 10000
  return s
}

export default {
  start,
  stop,
  getNearest,
}
