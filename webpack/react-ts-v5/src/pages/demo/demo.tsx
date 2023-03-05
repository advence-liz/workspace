import React, { useEffect, FC } from 'react'
import { observer } from 'mobx-react'
import { useLocation } from 'react-router-dom'
import { useRouter } from '@routes/index'

import { useStores } from './stores'
import Com from './components/com'

const Demo: FC = () => {
  const { pageStore, globalStore } = useStores()
  const { pathname } = useLocation()

  const { jump } = useRouter()

  useEffect(() => {
    // pageStore.fetchData()
  })
  return (
    <div>
      <h1>{pathname}</h1>
      <h1>全局维度</h1>
      <p>全局维度 store 状态在页面之间传递</p>
      <p>globalStore.appTitle: {globalStore.appTitle}</p>
      {/* <p>
        globalStore.userInfo: <pre>{JSON.stringify(globalStore.userInfo)}</pre>
      </p> */}
      <h1>页面维度</h1>
      <p> 页面维度 store 状态在页面中的组件之间传递</p>
      <h3>pageStore.pageTitle:{pageStore.pageTitle}</h3>
      
      <Com />
      <Com />
     
    </div>
  )
}

export default observer(Demo)
