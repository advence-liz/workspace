import Vue from 'vue'
import css2rem from '@/lib/css2rem'

Vue.filter('rem', function(value) {
  return css2rem(value)
})
