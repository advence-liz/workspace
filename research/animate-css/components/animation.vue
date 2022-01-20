<script>
export default {
  name: 'css-animation',
  props: {
    animation: { type: Array, default: [{ class: 'tx' }, { class: 'ty' }] },
  },
  render(createElement) {
    const children = this.$slots.default
    function createdNode(root, level) {
      if (level === root.length) return children
      const node = root[level]
      return createElement(
        'div',
        {
          class: node.class,
          //   attrs: {
          //     id: node,
          //   },
        },
        [createdNode(root, level + 1)]
      )
    }

    const r = createdNode(this.animation, 0)

    return r
  },
  methods: {
    animationstart() {
      console.log('animationstart', new Date())
    },
    animationend() {
      console.log('animationend', new Date())
    },
  },
}
</script>
