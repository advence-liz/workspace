import React, { useEffect, FC } from 'react'
import { observer, useLocalObservable } from 'mobx-react'
import { useGlobalStore } from '@stores/global-store'
import { Layout } from 'antd'
import { useRouter } from '@routes/index'
import NavMenu from '../nav-menu'

const BlankLayout: FC<React.PropsWithChildren<{ route: RouteType }>> = ({ route, children }) => {
  const globalStore = useGlobalStore()

  // const store = useLocalObservable(() => ({
   
  // }))

  return (
    <Layout>
      <Layout.Header >
      
          {/* <NavMenu routes={route.childRoutes} /> */}
         
      </Layout.Header>
      <Layout.Content style={{ padding: 0, height: 'calc(100vh - 60px)', background: '#f4f7fa' }}>
        {children}
       
      </Layout.Content>
    </Layout>
  )
}

export default observer(BlankLayout)
