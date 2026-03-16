/**
 * 示例 1: 基础爬虫
 * 使用 axios 发送 HTTP 请求，获取网页内容
 */

import axios from 'axios';

// 目标网站（使用示例网站）
const TARGET_URL = 'https://example.com';

/**
 * 基础爬虫函数
 */
const basicCrawler = async () => {
  try {
    console.log('🚀 开始爬取:', TARGET_URL);
    console.log('⏳ 正在请求...\n');

    // 发送 GET 请求
    const response = await axios.get(TARGET_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000, // 10秒超时
    });

    // 输出响应信息
    console.log('✅ 请求成功！');
    console.log('📊 状态码:', response.status);
    console.log('📝 Content-Type:', response.headers['content-type']);
    console.log('📏 内容长度:', response.data.length, '字符');
    console.log('\n--- 网页内容预览 (前 500 字符) ---');
    console.log(response.data.substring(0, 500));
    console.log('...\n');

    // 返回数据
    return {
      url: TARGET_URL,
      status: response.status,
      data: response.data,
    };
  } catch (error) {
    console.error('❌ 爬取失败:', error.message);

    if (error.response) {
      // 服务器返回错误状态码
      console.error('状态码:', error.response.status);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('无响应');
    } else {
      // 其他错误
      console.error('错误详情:', error.message);
    }

    throw error;
  }
};

/**
 * 带重试机制的爬虫
 */
const crawlerWithRetry = async (url, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      console.log(`🔄 尝试第 ${i + 1} 次...`);
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        timeout: 10000,
      });
      console.log('✅ 成功！');
      return response.data;
    } catch (error) {
      console.log(`❌ 第 ${i + 1} 次失败: ${error.message}`);

      if (i === maxRetries - 1) {
        throw error;
      }

      // 等待后重试（指数退避）
      const delay = Math.pow(2, i) * 1000;
      console.log(`⏱️  等待 ${delay}ms 后重试...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// 执行爬虫
const main = async () => {
  console.log('='.repeat(60));
  console.log('基础爬虫示例');
  console.log('='.repeat(60));
  console.log();

  try {
    await basicCrawler();

    console.log('\n' + '='.repeat(60));
    console.log('带重试机制的爬虫示例');
    console.log('='.repeat(60));
    console.log();

    await crawlerWithRetry(TARGET_URL);
  } catch (error) {
    console.error('程序执行失败');
  }
};

main();
