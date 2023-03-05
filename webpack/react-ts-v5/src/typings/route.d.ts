declare type AppName = 'cube-client' | 'cube-data' | 'block-client' | 'block-data'

declare interface RouteType {
  // 主应用路由
  path?: string
  // 子应用 标识相同appName 共用一个wujie 实例
  appName?: AppName | string
  // 导航展示名称，如果为空，只生成路由但不展示导航中
  name?: string
  // 子应用链接
  url?: string
  // 是否降级为 iframe
  iframe?: boolean
  // tooltip信息只有外链才可使用
  tooltip?: string
  // 单例模式
  singleton?: boolean
  auth?: 'admin' | 'developAdmin' | 'developer' | 'super'
  icon?: React.ReactNode
  exact?: boolean
  strict?: boolean
  redirect?: string
  component?: React.LazyExoticComponent<React.FC<{}>> | React.ElementType
  childRoutes?: RouteType[]
}
