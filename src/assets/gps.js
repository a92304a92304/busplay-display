// https://developer.mozilla.org/zh-TW/docs/Web/API/Geolocation/watchPosition

var id, target, options;

const success = (pos) => {
  var crd = pos.coords
  console.log(pos)
  if (target.latitude === crd.latitude && target.longitude === crd.longitude) {
    console.log('Congratulations, you reached the target')
    navigator.geolocation.clearWatch(id)
  }
}

const error = (err) => {
  console.warn('ERROR(' + err.code + '): ' + err.message)
}

target = {
  latitude : 0,
  longitude: 0
}

options = {
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 0
}

id = navigator.geolocation.watchPosition(success, error, options)
