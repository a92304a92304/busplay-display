<template lang="pug">
.card.item.mb-2(:style='{ borderLeftColor: route.color, animationDelay: `${index * 0.05}s` }')
  .card-body(@click.stop='gotoRoute(route.id)')
    .row.align-items-center
      .col.col-md-auto.text-left.text-md-center
        .name.mr-3.mr-md-0.d-inline-block.d-md-block {{ route.name.ch }}
        span(v-if='route.name.hasOwnProperty(`en`)') {{ route.name.en }}
      .col-12.col-md
        .departure
          fa.mr-2(icon='map-marker' size="xs")
          span {{ route.departure.ch }}
          small(v-if='route.departure.hasOwnProperty(`en`)') {{ route.departure.en }}
        .destination
          fa.mr-2(icon='angle-right')
          span {{ route.destination.ch }}
          small(v-if='route.destination.hasOwnProperty(`en`)') {{ route.destination.en }}
      .col-auto.direction-btn.mt-3.mt-md-0
        button.btn.btn-primary(@click.stop='gotoRoute(route.RID, `go`)') 去程
        button.btn.btn-primary(@click.stop='gotoRoute(route.RID, `back`)') 返程
        span.badge.badge-primary.ml-2 {{ route.RID }}
</template>

<script>
export default {
  name: 'RouteListItem',
  props:{
    route: { type: Object, default: {} },
    index: { type: Number , default: 0 },
    config: {
      type: Object,
      default () { return  { position: `gps` }  }
    },
  },
  methods: {
    gotoRoute (id, direction = `go`) {
      this.$router.push(`/display/${id}?direction=${direction}&position=${this.config.position}`)
    }
  }
}
</script>

<style scoped lang="sass">
@import "~bootswatch/dist/lux/variables"
@import "~bootstrap/scss/bootstrap"
@import "~bootswatch/dist/lux/bootswatch"


.item
  border-left: .5rem solid #bbb
  text-align: left

  .card-body
    display: block
    &:hover
      background-color: $gray-300
      text-decoration: none
      cursor: pointer

  .name
    font-size: 2rem
    font-weight: 900

  .departure, .destination
    color: $gray-700
    font-size: 1.5rem
    font-weight: bold
    span
      margin-right: .5rem

  .direction-btn
    button
      border-right: solid white 1px
      border-bottom: solid white 1px

</style>
