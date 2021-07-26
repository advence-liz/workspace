import Inster from '@hfe/block-core/intersection'
/**
 * Intersection Observer API提供了一种异步检测目标元素与祖先元素或 viewport 相交情况变化的方法。
 * 非必须业务根据需要自行引入，下面提供一个简单的例子
 * 详见 https://developer.mozilla.org/zh-CN/docs/Web/API/Intersection_Observer_API
 * @example
 *   initMV() {
 *         let options = {
 *             root: document.getElementById('coupon-group-campus'),
 *             rootMargin: '0px',
 *             threshold: 1.0
 *         }
 *         const _this = this
 *         let observer = new IntersectionObserver((entries, observer) => {
 *             entries.forEach(function(entry) {
 *                 if (entry.isIntersecting) {
 *                     _this.MV(~~entry.target.dataset.index)
 *                     observer.unobserve(entry.target)
 *                 }
 *             })
 *         }, options)
 *         const coupons = this.$refs.coupons || []
 *
 *         coupons.forEach(ele => {
 *             observer.observe(ele)
 *         })
 *     }
 */
Inster()
