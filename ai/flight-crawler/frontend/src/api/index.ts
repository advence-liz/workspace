import axios from 'axios';
import { message } from 'antd';
import { getAdminToken } from '@/utils/auth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 120000, // 默认 2 分钟，应对 Render 免费机器冷启动和慢查询
});

// 请求拦截器：自动注入 Admin Token
api.interceptors.request.use(
  (config) => {
    const token = getAdminToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      message.error('Token 错误或未设置，请在数据管理页面配置管理员 Token');
    }
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
