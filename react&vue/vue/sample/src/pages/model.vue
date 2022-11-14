<template>
    <div style="width: 460px">
        <DynamicForm v-model="navs" />
    </div>
</template>
<style lang="scss">
.demo-dynamic {
    width: 460px;
}
</style>
<script>
import DynamicForm from '../components/DynamicForm'
export default {
    components: {
        DynamicForm
    },

    data() {
        return {
            navs: [
                { title: '首页', url: 'http://eee' },
                { title: '列表', url: 'http://eee' },
                { title: '详情', url: 'http://eee' }
            ]
        }
    },
    mounted() {},
    methods: {}
}
</script>