interface Params {
  start: number
  length: number
  status: boolean
}
interface Data {
  code: number
  data: {
    list: List[]
  }
  msg: string
}
interface List {
  title: string
  id: number
  update_time: string
}
interface Response {
  code: number
  data: Data
  msg: string
}

export { Params, Response, List }
