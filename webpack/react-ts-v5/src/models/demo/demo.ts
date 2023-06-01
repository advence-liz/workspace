import { get, post } from '@services/request'
import Api from '@services/api'
import { PageListParams, DataType, ListType } from '@models/demo/demo-type'

export default {
  /**
   * 获取列表
   */
  getList(params: PageListParams): Promise<ListType[]> {
    return post<ListType[]>(Api.common.library, params, {
      errorTips: '获取列表失败',
    })
  },
  getComList(params: ListType): Promise<ListType[]> {
    return post<ListType[]>(Api.common.library, params, {
      errorTips: '获取列表失败',
    })
  },
  getUser(): Promise<DataType> {
    return get<DataType>(Api.account.auth)
  },
}
