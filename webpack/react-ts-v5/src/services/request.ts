import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { message } from 'antd'
import Nprogress from 'nprogress'
import 'nprogress/nprogress.css'
import { BASE_URL } from '@config/config'

type Options = {
  errorTips?: String
}

interface RequestConfig extends AxiosRequestConfig {
  options: Options
}

interface Response extends AxiosResponse {
  config: RequestConfig
}

const service = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 5000,
})

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    Nprogress.start()
    return config
  },
  (error) => {
    message.error(`请求失败-${error}`)
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response: Response) => {
    Nprogress.done()
    if (response && response.status === 200 && response.data) {
      const res = response.data
      if (res.code === 0) {
        return res
      } else {
        const { options } = response.config
        const errorTips = options?.errorTips || res.msg

        message.error(`请求失败：${errorTips}`)
        return res
      }
    }

    return response.data
  },
  (error) => {
    Nprogress.done()
    message.error(`请求失败-${error}`)
    return Promise.reject(error)
  },
)

function request<T>(config: RequestConfig): Promise<T> {
  return new Promise((resolve, reject) => {
    service
      .request<RequestConfig, T>(config)
      .then((res) => {
        resolve(res)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

/**
 * 封装get方法
 * @param url
 * @param params
 * @returns {Promise}

 */
export function get<T>(url: string, params = {}, options = {}): Promise<T> {
  return request<T>({
    url,
    params,
    options,
    method: 'GET',
  })
}

/**
 * 封装post请求
 * @param url
 * @param params
 * @returns {Promise}
 */
export function post<T>(url: string, data = {}, options = {}): Promise<T> {
  return request<T>({
    url,
    data,
    options,
    method: 'POST',
  })
}
