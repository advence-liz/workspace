import { get } from '@services/request'
import Api from '@services/api'

// let done: boolean = false

export default async function () {
  const { code, data } = await get<Response<UserInfo>>(Api.account.auth)
  return code === 0 ? data : null
}
