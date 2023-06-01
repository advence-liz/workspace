import { makeAutoObservable } from 'mobx'
import ProxyGlobalStore, { GlobalStore } from '@stores/global-store'

class RouterStore {
  openKeys: string[] = []

  selectedKeys: string[] = []

  globalStore: GlobalStore = null

  constructor() {
    makeAutoObservable(this)
    this.globalStore = new ProxyGlobalStore()
  }

  setSelectedKeys(keys: string[]) {
    this.selectedKeys = keys
  }

  setOpenKeys(keys: string[]) {
    this.openKeys = keys
  }

  onOpenChange(keys: string[]) {
    this.setOpenKeys(keys)
  }

  isAuth(route: RouteType): boolean {
   
    return true
  }
}

export default RouterStore
