
const get = (route) => {
  const rules = route.rules
  const current = route.current
  const stations = route.stations

  const nextSID = stations[route.current.nextIndex].SID || null  // 下一站的 SID
  const nextDistance = route.current.nextMinDistance || Infinity     // 目前位置和下一站的最小距離

  const result = []

  rules.forEach((rule) => {   // 迭代所有 rules 列表
    switch (rule.condition) {
      case 1:  // 第一個類型: 抵達 ＿ 站前 ＿ 公尺，進行廣播。
        if (parseInt(rule.SID) === parseInt(nextSID)) {   //  若 SID 符合
          if (rule.distance >= nextDistance) {        // 若距離符合
            result.push(rule.content)
          }
        }
        break
      case 2:  // 第二個類型: 和下一站距離 ＿ 公尺，進行廣播。
        if (stations[route.current.nextIndex].distance >= rule.distance) {
          result.push(rule.content)
        }
        break
    }
  })
  return result
}


export default {
  get
}
