import React, { Suspense } from 'react'
import { HashRouter as Router, Route, Switch, Redirect, useHistory } from 'react-router-dom'
import { observer } from 'mobx-react'
import LoadingPage from '@components/loading/loading'
import { config } from './config'

const AppRouter = () => {
  const renderRoutes = (routes: RouteType[]) => {
    if (!Array.isArray(routes)) {
      return null
    }

    return (
      <Switch>
        {routes.map((route, index) => {
          if (!route.path) return null
          if (route.redirect) {
            return (
              <Redirect
                key={route.path || index}
                exact={route.exact}
                strict={route.strict}
                from={route.path}
                to={route.redirect}
              />
            )
          }

          return (
            <Route
              key={route.path}
              path={route.path}
              exact={route.exact}
              strict={route.strict}
              render={() => {
                const renderChildRoutes = renderRoutes(route.childRoutes)
                if (route.component) {
                  return (
                    <Suspense fallback={<LoadingPage />}>
                      <route.component route={route}>{renderChildRoutes}</route.component>
                    </Suspense>
                  )
                }
              
              }}
            />
          )
        })}
      </Switch>
    )
  }
  return <Router basename="/">{renderRoutes(config)}</Router>
}

export default observer(AppRouter)
