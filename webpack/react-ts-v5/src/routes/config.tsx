import React, { lazy } from 'react'
import {
  UserOutlined,
  StarOutlined,
  ApartmentOutlined,
  ToolOutlined,
  FileTextOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import { BASE_URL } from '@config/config'
import BlankLayout from '../layouts/blank-layout'
import BasicLayout from '../layouts/base-layout'


export const config: RouteType[] = [
  {
    path: '/',
    component: BlankLayout, // 带有顶部导航
    childRoutes: [
      // 子菜单路由 
      {
        path: '/demo',
        name: '',
        // icon: <StarOutlined />,
        component: lazy(() => import('@pages/demo/demo')),
      },
      {
        path: '/sub',
        name: 'sub',
        // icon: <StarOutlined />,
        component: BasicLayout,
        childRoutes:[
          {
            path: '/sub/sub-1',
            name: 'sub-1',
            // icon: <StarOutlined />,
            component: lazy(() => import('@pages/demo/demo')),
          },
          {
            path: '/sub/sub-2',
            name: 'sub-2',
            // icon: <StarOutlined />,
            component: lazy(() => import('@pages/demo/demo')),
          },
        ]
      },
      {
        path: '/not-found',
        name: '',
        // exact: true,
        // icon: <WarningOutlined />,
        component: lazy(() => import('@pages/not-found/not-found')),
      },
      { path: '/', exact: true, redirect: '/demo' },
      { path: '*', exact: true, redirect: '/not-found' },
    ],
  },
]
