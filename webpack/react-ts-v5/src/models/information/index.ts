import { get, post } from '@services/request'
import Api from '@services/api'
import * as ListType from './type/list'

export default {
  /**
   * 获取列表
   */
  async list(params: ListType.Params): Promise<ListType.Response> {
    return get<ListType.Response>(Api.admin.information.list, params, {
      errorTips: '获取列表失败',
    })
  },
}
