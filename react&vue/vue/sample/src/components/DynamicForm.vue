<template>
    <div>
        <div class="nav-tag__wrap">
            <el-tag
                v-for="(nav, index) in dynamicValidateForm.navs"
                :key="nav.key+ index + 'tag'"
                effect="dark"
                class="nav-tag"
                type="primary"
            >{{nav.title}}</el-tag>
            <i class="el-icon-setting" @click="toggleSetting">设置</i>
        </div>
        <div v-show="showSetting" class="nav-setting">
            <el-form
                :model="dynamicValidateForm"
                ref="dynamicValidateForm"
                label-width="100px"
                size="mini"
            >
                <template v-for="(nav, index) in dynamicValidateForm.navs">
                    <el-form-item
                        :label="'标题' + index"
                        :key="nav.key+ 'title'"
                        :prop="'navs.' + index + '.title'"
                        :rules="{required: true, message: '标题不能为空', trigger: 'blur'}"
                    >
                        <el-row>
                            <el-col :span="12">
                                <el-input v-model="nav.title"></el-input>
                            </el-col>
                        </el-row>
                    </el-form-item>
                    <el-form-item
                        :label="'链接' + index"
                        :key="nav.key"
                        :prop="'navs.' + index + '.url'"
                        :rules="{required: true, message: '链接不能为空', trigger: 'blur'}"
                    >
                        <el-row>
                            <el-col :span="12">
                                <el-input v-model="nav.url"></el-input>
                            </el-col>
                            <el-col :span="6">
                                <el-button v-if="index !==0" @click.prevent="removeNav(nav)">删除</el-button>
                            </el-col>

                            <el-col :span="6">
                                <el-button
                                    type="primary"
                                    v-if="index === dynamicValidateForm.navs.length - 1 "
                                    @click="addNav()"
                                >新增</el-button>
                            </el-col>
                        </el-row>
                    </el-form-item>
                </template>
                <el-form-item>
                    <el-button type="primary" @click="submitForm('dynamicValidateForm')">保存</el-button>
                </el-form-item>
            </el-form>
        </div>
    </div>
</template>
<style scoped lang="scss">
.nav-tag {
    width: 60px;
    // font-size: 14px;
    text-align: center;
    margin: 10px 5px;
    // background: #20a0ff;
    &__wrap {
        padding: 20px;
        padding-left: 50px;
        text-align: left;
    }
}
</style>
<script>
let seed = 0
export default {
    model: {
        prop: 'navs', // 对应 props msg
        event: 'change'
    },
    props: {
        navs: {
            type: Array,
            default() {
                return [
                    { title: '首页', url: 'http://eee' },
                    { title: '列表', url: 'http://eee' },
                    { title: '详情', url: 'http://eee' }
                ]
            }
        }
    },
    data() {
        return {
            showSetting: false,
            dynamicValidateForm: {
                navs: []
            }
        }
    },
    mounted() {
        for (let nav of this.navs) {
            this.addNav(nav)
        }
    },
    methods: {
        toggleSetting() {
            this.showSetting = !this.showSetting
        },
        submitForm(formName) {
            this.$refs[formName].validate((valid) => {
                if (valid) {
                    this.$emit('change', this.dynamicValidateForm.navs)
                    alert('submit!')
                } else {
                    console.log('error submit!!')
                    return false
                }
            })
        },
        resetForm(formName) {
            this.$refs[formName].resetFields()
        },
        removeNav(item) {
            var index = this.dynamicValidateForm.navs.indexOf(item)
            if (index !== -1) {
                this.dynamicValidateForm.navs.splice(index, 1)
            }
        },
        addNav(nav = { title: '标题', url: '', key: 0 }) {
            nav.key = Date.now() + seed++
            this.dynamicValidateForm.navs.push(nav)
        }
    }
}
</script>