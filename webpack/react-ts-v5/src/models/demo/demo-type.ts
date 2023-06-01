export interface PageListParams {
  index: number
  pageSize: number
  queryScopeEnum: string
}

export type DataType = {
  mis: string
  name: string
}

export type ListType = {
  keyword: string
  length: number
  sortType: number
  tags: []
}
