const get = (route) => {
  const rules = route.rules
  const current = route.current
  const stations = route.stations

  rules.forEach((val) => {
    console.log(val)
  })
  // console.log(rules, current, stations)
}


export default {
  get
}
