declare interface Response<T> {
  code?: number
  msg?: string
  data: T
}

declare interface List<T> {
  list: T[]
  total: number
}
