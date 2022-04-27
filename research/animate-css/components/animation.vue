<script>
export default {
    name: 'css-animation',
    props: {
        animation: { type: Array, default: [{ class: 'tx' }, { class: 'ty' }] }
    },
    render(createElement) {
        const children = this.$slots.default
        const _this = this
        function createdNode(root, level) {
            if (level === root.length) return children
            const node = root[level]
            let opts = {
                class: node.class
                //   attrs: {
                //     id: node,
                //   },
            }
            // 事件绑定到最外层，不然内层动画触发通用会导致外层动画触发
            if (level === root.length - 1) {
                opts.on = {
                    animationstart: _this.animationstart,
                    animationend: _this.animationend
                }
            }

            return createElement('div', opts, [createdNode(root, level + 1)])
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
        }
    }
}
</script>
