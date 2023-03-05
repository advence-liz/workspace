import {  useHistory } from 'react-router-dom'


function useRouter() {
  const history = useHistory()
  const jump = (route: RouteType) => {
    // 主应用导航
    if (route.path) {
        history.push(route.path)
  
    }
   
    // 跳转外部站点
    if (!route.path && route.url) {
      window.open(route.url, '_blank')
    }
  }

  return { jump }
}

export { useRouter }
