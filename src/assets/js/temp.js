const testAdImg = [`https://i.imgur.com/WEJUNI5.jpg`, `https://i.imgur.com/qcMD0zD.jpg`, `https://i.imgur.com/QZ7z7ao.jpg`]
testAdImg.forEach((img) => {
  vm.carousels.push({
    type: `ad`,
    content: {
      title: { ch: null, en: null },
      content: { ch: null, en: null },
      img
    },
    duration: 5000,
  })
})

vm.carousels.push({
  type: `ad`,
  content: {
    title: {
      ch: `乘車注意事項`,
      en: `Notice`,
    },
    content: {
      ch: `為了維護服務品質，請勿在車內吸煙、飲食、嚼食口香糖或檳榔，謝謝您的配合，祝您旅途愉快。`,
      en: `Please do not smoke, eat, drink, chew gum or betel nut in the car. Have a nice trip.`
    },
    img: `https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/No_smoking_symbol.svg/2000px-No_smoking_symbol.svg.png`
  },
  duration: 5000,
})
vm.carousels.push({
  type: `ad`,
  content: {
    title: {
      ch: `博愛座`,
      en: `Priority Seat`,
    },
    content: {
      ch: `請優先讓位給老人、孕婦、行動不便者，及抱小孩的乘客。`,
      en: `Priority to senior citizen, pregnant and passenger who is disabled or with child.`
    },
    img: `https://i.imgur.com/w30cXdK.jpg?博愛座`
  },
  duration: 5000,
})
