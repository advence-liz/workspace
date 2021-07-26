import Vue from 'vue'
import dateFormat from '@/lib/dateFormat'

// 首字母大写过滤器
Vue.filter('datetime', function(value, pattern = 'yyyy-MM-dd') {
  if (!value) return ''
  return dateFormat.format(new Date(value), pattern)
})
