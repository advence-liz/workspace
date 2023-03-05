import { observable, action } from 'mobx'
// import request from '@/services/request';

class GlobalStore {
  @observable appTitle = '平台'

  @observable collapsed = false // 菜单收起展开

  @observable userInfo: any = null
  @action.bound toggleCollapsed() {
    this.collapsed = !this.collapsed
  }

  @action.bound setData(data = {}) {
    Object.entries(data).forEach((item) => {
      this[item[0]] = item[1]
    })
  }
}

export default new Proxy(GlobalStore, {
  construct(Target: any) {
    if (!Target.instance) {
      Target.instance = new Target()
    }

    return Target.instance
  },
})
