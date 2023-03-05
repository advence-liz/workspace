import React, { FC } from 'react'
import style from './loading.scss'

const Loading: FC = () => (
  <div className={`${style['components-loading']} ${style['components-loading-opacity']}`}>
    <div className={style['loading-con']}>
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
      <span />
    </div>
  </div>
)

export default Loading
