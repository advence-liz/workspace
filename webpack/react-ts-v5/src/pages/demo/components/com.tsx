import React, { useEffect, FC } from 'react'
import { observer, useLocalObservable, useObserver } from 'mobx-react'
// import { makeAutoObservable } from 'mobx'
import { Button, Input } from 'antd'
import { useStores } from '../stores'
/**
 * 组件维度 store 状态只在组件中起效，用于取代 state
 */

// const store = new ComState()

const Com: FC = () => {
  /**
   * 1.业务组件 可以直接获取操作  pageStore globalStore
   * 2.复用组件 只可以操作 globalStore （globalStore 为单例）
   */
  console.count('comInit')
  const { pageStore, globalStore } = useStores()

  const store = useLocalObservable(() => ({
    comName: 'com',
    comNum: 0,
    addNum() {
      store.comNum += 1
    },
  }))

  useEffect(() => {
    // pageStore.fetchData()
    // console.log(store)
  })
  return (
    <div>
      <h1>组件维度</h1>
      <p>组件维度 store 状态只在组件中起效，用于取代 state</p>
      <p>store.comName:{store.comName}</p>
      <p>store.comNum:{store.comNum}</p>
      <Button onClick={() => store.addNum()}>+1</Button>
      <Button
        onClick={() => {
          pageStore.setPageTitle('comTitle')
        }}
      >
        setPageTitle
      </Button>
    </div>
  )
}

export default observer(Com)
