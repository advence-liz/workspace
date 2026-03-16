# 快速开始指南

## 🚀 5 分钟上手

### 1. 安装依赖
```bash
cd node-crawler-demo
npm install
```

### 2. 运行第一个爬虫
```bash
npm run basic
```

你将看到：
- ✅ HTTP 请求成功
- 📊 响应状态码
- 📝 网页内容预览
- 🔄 重试机制演示

### 3. 尝试 HTML 解析
```bash
npm run cheerio
```

这个示例会：
- 🕷️ 爬取 example.com
- 📋 提取标题、链接、段落
- 🔥 爬取 GitHub Trending（实时数据）

### 4. 体验动态网页爬取
```bash
npm run puppeteer
```

**注意**: 首次运行会下载 Chromium（约 200MB），请耐心等待。

功能演示：
- 🌐 启动无头浏览器
- 📸 网页截图
- 🔍 模拟搜索操作

### 5. 批量爬取
```bash
npm run concurrent
```

学习：
- ⚡ 并发控制
- 📊 进度显示
- 🎯 性能对比

## 📝 代码示例

### 最简单的爬虫（5 行代码）
```javascript
import axios from 'axios';

const response = await axios.get('https://example.com');
console.log(response.data);
```

### 解析 HTML（10 行代码）
```javascript
import axios from 'axios';
import * as cheerio from 'cheerio';

const response = await axios.get('https://example.com');
const $ = cheerio.load(response.data);

const title = $('h1').text();
const links = $('a').map((i, el) => $(el).attr('href')).get();

console.log('标题:', title);
console.log('链接:', links);
```

### 并发爬取（15 行代码）
```javascript
import axios from 'axios';
import pLimit from 'p-limit';

const urls = [
  'https://example.com',
  'https://www.iana.org',
  // ...更多 URL
];

const limit = pLimit(3); // 限制并发数为 3

const tasks = urls.map(url =>
  limit(() => axios.get(url))
);

const results = await Promise.all(tasks);
console.log(`成功爬取 ${results.length} 个页面`);
```

## 🎯 实战练习

### 练习 1: 爬取你喜欢的博客
1. 打开 `src/examples/cheerio-crawler.js`
2. 修改 URL 为目标博客
3. 调整 CSS 选择器
4. 运行并查看结果

### 练习 2: 创建价格监控器
创建 `src/examples/price-monitor.js`:
```javascript
import axios from 'axios';
import * as cheerio from 'cheerio';

const checkPrice = async (url) => {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  // 根据实际网站调整选择器
  const price = $('.price').text();

  console.log('当前价格:', price);
  return price;
};

// 定时检查
setInterval(() => {
  checkPrice('商品URL');
}, 60000); // 每分钟检查一次
```

### 练习 3: 批量下载图片
创建 `src/examples/image-downloader.js`:
```javascript
import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';

const downloadImages = async (url) => {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const images = $('img').map((i, el) => $(el).attr('src')).get();

  for (const imgUrl of images) {
    const imgResponse = await axios.get(imgUrl, {
      responseType: 'arraybuffer'
    });

    const filename = imgUrl.split('/').pop();
    await fs.writeFile(`./images/${filename}`, imgResponse.data);
    console.log('下载完成:', filename);
  }
};
```

## 🛠️ 常用工具函数

项目已包含实用工具（`src/utils/helpers.js`）：

```javascript
import {
  sleep,              // 延迟
  randomSleep,        // 随机延迟
  retry,              // 重试机制
  getRandomUserAgent, // 随机 UA
  saveToJson,         // 保存 JSON
  RateLimiter,        // 限流器
  Logger,             // 日志工具
} from './utils/helpers.js';

// 使用示例
await sleep(1000);                    // 延迟 1 秒
await randomSleep(1000, 3000);        // 随机延迟 1-3 秒
const data = await retry(() => fetch(url)); // 自动重试
```

## 📚 学习资源

### 查看完整教程
```bash
cat LEARNING.md
```

### 查看项目文档
```bash
cat README.md
```

### 查看代码示例
```bash
# 基础爬虫
cat src/examples/basic-crawler.js

# Cheerio 爬虫
cat src/examples/cheerio-crawler.js

# Puppeteer 爬虫
cat src/examples/puppeteer-crawler.js

# 并发爬虫
cat src/examples/concurrent-crawler.js

# 实战示例
cat src/examples/real-world-example.js
```

## 🐛 常见问题

### Q: 安装依赖时出错？
```bash
# 清除缓存重试
rm -rf node_modules package-lock.json
npm install
```

### Q: Puppeteer 安装失败？
```bash
# 跳过 Chromium 下载
PUPPETEER_SKIP_DOWNLOAD=true npm install puppeteer

# 或使用系统 Chrome
npm install puppeteer-core
```

### Q: 请求被拒绝（403/429）？
- 添加合适的 User-Agent
- 增加请求延迟
- 使用代理 IP

### Q: 找不到元素？
- 使用 Chrome DevTools 检查选择器
- 确认是否为动态内容（需用 Puppeteer）
- 检查页面是否需要登录

## 🎉 下一步

1. ✅ 运行所有示例
2. 📖 阅读 LEARNING.md
3. 🔧 修改代码并实验
4. 🚀 开发自己的爬虫项目

祝你学习愉快！如有问题，查看 LEARNING.md 或搜索相关文档。
