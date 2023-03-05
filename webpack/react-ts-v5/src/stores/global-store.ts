import { makeAutoObservable, runInAction } from 'mobx'
import account from '@utils/auth/account'

export class GlobalStore {
  static instance: GlobalStore

  appTitle = '平台'

  userInfo: UserInfo = null

  // 案例中心搜索关键词
  caseKeywords: string

  // 组件中心搜索关键词
  componentKeywords: string

  collapsed = false

  constructor() {
    makeAutoObservable(this)
  }

  toggleCollapsed() {
    this.collapsed = !this.collapsed
  }

  setCaseKeywords(val: string) {
    this.caseKeywords = val
  }

  setComponentKeywords(val: string) {
    this.componentKeywords = val
  }

  
}
const ProxyGlobalStore = new Proxy(GlobalStore, {
  construct(Target) {
    if (!Target.instance) {
      Target.instance = new Target()
    }

    return Target.instance
  },
})

export const useGlobalStore = () => new ProxyGlobalStore()
export default ProxyGlobalStore
