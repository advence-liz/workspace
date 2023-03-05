import React from 'react'
import {Button,Layout} from 'antd'
import { useGlobalStore } from '@stores/global-store'
import { observer, useLocalObservable } from 'mobx-react'
import SiderMenu from './sider-menu'

const BaseLayout: React.FC = ({ route, children }: React.PropsWithChildren<{ route: RouteType }>) => {
  const globalStore = useGlobalStore()
  const store = useLocalObservable(() => ({
    foldBtnIcon: 'collapse',
    handleFold() {
      globalStore.toggleCollapsed()
      store.foldBtnIcon = store.foldBtnIcon === 'collapse' ? 'expand' : 'collapse'
    },
  }))
  const { collapsed } = globalStore
  const { handleFold, foldBtnIcon } = store

  return (
    <Layout>
      <Layout.Sider
        style={{ width: collapsed ? 50 : 160, position: 'sticky', top: 0, height: 'calc(100vh - 60px)' }}
      >
        <SiderMenu collapsed={collapsed} routes={route.childRoutes} />
        <Button
          onClick={handleFold}
          icon={foldBtnIcon}
       
          style={{ position: 'absolute', bottom: 10, left: 20 }}
        />
      </Layout.Sider>

      {/* <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb> */}
      <Layout.Content
        style={{
          padding: 16,
          margin: 0,
          minHeight: 900,
          position: 'relative',
          // background: colorBgContainer,
          background: '#F7F8FC',
        }}
      >
        {children}
      </Layout.Content>
    </Layout>
  )
}

export default observer(BaseLayout)
