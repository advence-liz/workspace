import React, { useEffect } from 'react'
import { Link, useLocation, useHistory } from 'react-router-dom'
import { observer, useLocalObservable } from 'mobx-react'
import { Layout, Menu, Row } from 'antd';

import { useRouter } from '@routes/index'
import RouterStore from '@stores/router-store'

const SiderMenu = ({ routes, collapsed }: { routes: RouteType[]; collapsed: boolean }) => {
  const { pathname } = useLocation()
  const { jump } = useRouter()
  const store = useLocalObservable(() => new RouterStore())
  /**
   * pathname '/system/user'
   * list ['system', 'user']
   * selectedKeys ['/system','/system/user']
   */
  useEffect(() => {
    // console.count('useEffect')
    const list = pathname.split('/').splice(1)
    const keys = list.map((item, index) => `/${list.slice(0, index + 1).join('/')}`)
    store.setSelectedKeys(keys)

    store.setOpenKeys(keys)
  }, [pathname, store])

  const renderMenuItem = (target: RouteType[]) =>
    target
      .filter((item) => item.path && item.name)
      .map((subMenu) => {
        if (!store.isAuth(subMenu)) {
          return null
        }
        if (subMenu.childRoutes && !!subMenu.childRoutes.find((child) => child.name)) {
          return (
            <Menu.SubMenu
              key={subMenu.path}
              title={
                <div>
                  {!!subMenu.icon && subMenu.icon}
                  <span>{subMenu.name}</span>
                </div>
              }
            >
              {renderMenuItem(subMenu.childRoutes)}
            </Menu.SubMenu>
          )
        }

        return (
          <Menu.Item
            key={subMenu.path}
            onClick={() => {
              jump(subMenu)
            }}
          >
            <span>
              {!!subMenu.icon && subMenu.icon}
              <span>{subMenu.name}</span>
            </span>
          </Menu.Item>
        )
      })
  return (
    <Menu
      mode="inline"
      theme="light"
      inlineCollapsed={collapsed}
      openKeys={store.openKeys}
      onOpenChange={(keys) => {
        store.onOpenChange(keys)
      }}
      selectedKeys={store.selectedKeys}
    >
      {renderMenuItem(routes)}
    </Menu>
  )
}

export default observer(SiderMenu)
