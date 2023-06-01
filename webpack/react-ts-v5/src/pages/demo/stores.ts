import { makeAutoObservable } from 'mobx'
import { createContext, useContext } from 'react'
import luckydrawModel from '@models/demo/demo'
import GlobalStore from '@stores/global-store'
import { DataType, ListType } from '@models/demo/demo-type'

interface PageListParams {
  index: number
  pageSize: number
  queryScopeEnum: QueryScope
}

type QueryScope = 'OWN_SCOPE' | 'ALL_SCOPE'
/**
 * Mobox 作用 1.状态管理替换 state 2.双向绑定简化逻辑
 * store 内容包含 数据 和 逻辑
 * 执行原则 全面采用 store
 * 全局维度 store 状态在页面之间传递
 * 页面维度 store 状态在页面中的组件之间传递
 * 组件维度 store 状态只在组件中起效，用于取代 state
 * 业务组件 可以直接获取操作  pageStore globalStore
 * 复用组件 只可以操作 globalStore （globalStore 为单例）
 */
class PageState {
  pageTitle: string = 'pageTitle'

  count: number = 0

  list: ListType[] = []

  constructor() {
    makeAutoObservable(this)
  }

  setPageTitle(title: string) {
    this.pageTitle = title
  }

  async fetchData(): Promise<DataType> {
    const data: DataType = await luckydrawModel.getUser()

    return data
  }

  async fetchList(): Promise<void> {
    const params: PageListParams = {
      index: 0,
      pageSize: 10,
      queryScopeEnum: 'OWN_SCOPE',
    }
    const data: ListType[] = await luckydrawModel.getList(params)

    this.list = data
  }
}

const StoresContext = createContext({
  pageStore: new PageState(),
  globalStore: new GlobalStore(),
})
export const useStores = () => useContext(StoresContext)
