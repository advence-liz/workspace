/**
 * 爬虫工具函数
 */

/**
 * 延迟函数
 * @param {number} ms - 延迟毫秒数
 */
export const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

/**
 * 随机延迟
 * @param {number} min - 最小延迟（毫秒）
 * @param {number} max - 最大延迟（毫秒）
 */
export const randomSleep = async (min = 1000, max = 3000) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await sleep(delay);
};

/**
 * 重试函数
 * @param {Function} fn - 要执行的异步函数
 * @param {number} maxRetries - 最大重试次数
 * @param {number} delay - 重试间隔（毫秒）
 */
export const retry = async (fn, maxRetries = 3, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      console.log(`重试 ${i + 1}/${maxRetries}...`);
      await sleep(delay * Math.pow(2, i)); // 指数退避
    }
  }
};

/**
 * 获取随机 User-Agent
 */
export const getRandomUserAgent = () => {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
};

/**
 * 清理文本（去除多余空白字符）
 * @param {string} text
 */
export const cleanText = (text) => {
  return text.replace(/\s+/g, ' ').trim();
};

/**
 * 验证 URL
 * @param {string} url
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 将相对 URL 转换为绝对 URL
 * @param {string} baseUrl - 基础 URL
 * @param {string} relativeUrl - 相对 URL
 */
export const resolveUrl = (baseUrl, relativeUrl) => {
  try {
    return new URL(relativeUrl, baseUrl).href;
  } catch {
    return null;
  }
};

/**
 * 保存数据到 JSON 文件
 * @param {string} filename - 文件名
 * @param {any} data - 数据
 */
export const saveToJson = async (filename, data) => {
  const fs = await import('fs/promises');
  await fs.writeFile(filename, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ 数据已保存到: ${filename}`);
};

/**
 * 从 JSON 文件加载数据
 * @param {string} filename - 文件名
 */
export const loadFromJson = async (filename) => {
  const fs = await import('fs/promises');
  const content = await fs.readFile(filename, 'utf-8');
  return JSON.parse(content);
};

/**
 * 格式化字节大小
 * @param {number} bytes
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * 创建进度条
 * @param {number} current - 当前进度
 * @param {number} total - 总数
 * @param {number} width - 进度条宽度
 */
export const createProgressBar = (current, total, width = 20) => {
  const percentage = (current / total) * 100;
  const filled = Math.floor((current / total) * width);
  const empty = width - filled;
  const bar = '█'.repeat(filled) + '░'.repeat(empty);
  return `[${bar}] ${percentage.toFixed(1)}% (${current}/${total})`;
};

/**
 * 限流器（控制请求频率）
 */
export class RateLimiter {
  constructor(maxRequests, timeWindow) {
    this.maxRequests = maxRequests; // 最大请求数
    this.timeWindow = timeWindow; // 时间窗口（毫秒）
    this.requests = [];
  }

  async acquire() {
    const now = Date.now();

    // 移除时间窗口外的请求
    this.requests = this.requests.filter(
      (time) => now - time < this.timeWindow
    );

    // 如果达到限制，等待
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      await sleep(waitTime);
      return this.acquire(); // 递归调用
    }

    // 记录请求时间
    this.requests.push(now);
  }
}

/**
 * 简单的日志工具
 */
export class Logger {
  constructor(prefix = '') {
    this.prefix = prefix;
  }

  info(message) {
    console.log(`ℹ️  ${this.prefix}${message}`);
  }

  success(message) {
    console.log(`✅ ${this.prefix}${message}`);
  }

  error(message) {
    console.error(`❌ ${this.prefix}${message}`);
  }

  warn(message) {
    console.warn(`⚠️  ${this.prefix}${message}`);
  }

  debug(message) {
    console.log(`🔍 ${this.prefix}${message}`);
  }
}
