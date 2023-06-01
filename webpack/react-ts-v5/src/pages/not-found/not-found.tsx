import React, { FC } from 'react'
import './not-found.scss'

const NotFound: FC = () => (
  <div className="error__grid">
    <div className="error__wrapper">
      <div className="error__block--grids">
        <div className="error__block--left">
          <h1>
            4<i className="fas fa-sad-tear">0</i>4
          </h1>
        </div>
        <div className="error-block-right">
          <h2 className="mt-5">Oops, Page not found!</h2>
          <p className="mt-sm-4 mt-3">hahhahahaha</p>
          <a href="/" className="tn back-button mt-md-5 mt-4">
            {' '}
            <span className="fa fa-arrow-left" />
            Back to Home
          </a>
        </div>
      </div>
    </div>
  </div>
)

export default NotFound
