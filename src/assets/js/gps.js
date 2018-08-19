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

const getNearest = (current, route) => {

}

export default {
  start,
  stop,
}
