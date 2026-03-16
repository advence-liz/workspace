/**
 * 示例 4: 并发爬虫
 * 使用并发控制进行批量数据抓取
 */

import axios from 'axios';
import * as cheerio from 'cheerio';
import pLimit from 'p-limit';

/**
 * 单个 URL 的爬取函数
 */
const crawlSingleUrl = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);
    const title = $('title').text().trim();

    return {
      url,
      success: true,
      title,
      status: response.status,
      length: response.data.length,
    };
  } catch (error) {
    return {
      url,
      success: false,
      error: error.message,
    };
  }
};

/**
 * 并发爬取多个 URL（无限制）
 */
const crawlAllAtOnce = async (urls) => {
  console.log(`🚀 开始爬取 ${urls.length} 个 URL（无并发限制）...\n`);

  const startTime = Date.now();

  // 使用 Promise.all 同时发起所有请求
  const results = await Promise.all(urls.map((url) => crawlSingleUrl(url)));

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`✅ 全部完成，耗时: ${duration}秒\n`);

  return { results, duration };
};

/**
 * 并发爬取多个 URL（限制并发数）
 */
const crawlWithLimit = async (urls, concurrency = 3) => {
  console.log(`🚀 开始爬取 ${urls.length} 个 URL（并发限制: ${concurrency}）...\n`);

  const startTime = Date.now();

  // 创建并发限制器
  const limit = pLimit(concurrency);

  // 创建任务数组，每个任务都会受到并发限制
  const tasks = urls.map((url, index) =>
    limit(async () => {
      console.log(`  ⏳ [${index + 1}/${urls.length}] 正在爬取: ${url}`);
      const result = await crawlSingleUrl(url);
      console.log(
        `  ${result.success ? '✅' : '❌'} [${index + 1}/${urls.length}] ${
          result.success ? '成功' : '失败'
        }: ${url}`
      );
      return result;
    })
  );

  // 等待所有任务完成
  const results = await Promise.all(tasks);

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`\n✅ 全部完成，耗时: ${duration}秒\n`);

  return { results, duration };
};

/**
 * 批量爬取（分批处理）
 */
const crawlInBatches = async (urls, batchSize = 5) => {
  console.log(`🚀 开始分批爬取 ${urls.length} 个 URL（每批 ${batchSize} 个）...\n`);

  const startTime = Date.now();
  const results = [];

  // 分批处理
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(urls.length / batchSize);

    console.log(`📦 处理第 ${batchNumber}/${totalBatches} 批 (${batch.length} 个 URL)...`);

    const batchResults = await Promise.all(batch.map((url) => crawlSingleUrl(url)));
    results.push(...batchResults);

    console.log(`✅ 第 ${batchNumber} 批完成\n`);

    // 批次间延迟（避免过快请求）
    if (i + batchSize < urls.length) {
      console.log('⏱️  等待 1 秒...\n');
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`✅ 全部完成，耗时: ${duration}秒\n`);

  return { results, duration };
};

/**
 * 带进度显示的爬虫
 */
const crawlWithProgress = async (urls, concurrency = 3) => {
  console.log(`🚀 开始爬取 ${urls.length} 个 URL（带进度显示）...\n`);

  const startTime = Date.now();
  const limit = pLimit(concurrency);

  let completed = 0;
  const results = [];

  const tasks = urls.map((url) =>
    limit(async () => {
      const result = await crawlSingleUrl(url);
      completed++;

      const progress = ((completed / urls.length) * 100).toFixed(1);
      const bar = '█'.repeat(Math.floor(completed / urls.length * 20));
      const empty = '░'.repeat(20 - Math.floor(completed / urls.length * 20));

      process.stdout.write(`\r  进度: [${bar}${empty}] ${progress}% (${completed}/${urls.length})`);

      results.push(result);
      return result;
    })
  );

  await Promise.all(tasks);

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`\n\n✅ 全部完成，耗时: ${duration}秒\n`);

  return { results, duration };
};

/**
 * 显示统计信息
 */
const displayStats = (results) => {
  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log('📊 统计信息:');
  console.log(`  ✅ 成功: ${successful}`);
  console.log(`  ❌ 失败: ${failed}`);
  console.log(`  📈 成功率: ${((successful / results.length) * 100).toFixed(1)}%`);

  if (failed > 0) {
    console.log('\n❌ 失败的 URL:');
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.url}: ${r.error}`);
      });
  }
};

// 主函数
const main = async () => {
  console.log('='.repeat(60));
  console.log('并发爬虫示例');
  console.log('='.repeat(60));
  console.log();

  // 测试 URL 列表
  const testUrls = [
    'https://example.com',
    'https://www.iana.org',
    'https://httpbin.org/html',
    'https://httpbin.org/delay/1',
    'https://httpbin.org/delay/2',
    'https://www.rfc-editor.org',
    'https://httpbin.org/status/200',
    'https://httpbin.org/status/404', // 会失败
  ];

  try {
    // 示例 1: 无限制并发
    console.log('📋 示例 1: 无限制并发\n');
    const result1 = await crawlAllAtOnce(testUrls);
    displayStats(result1.results);

    // 示例 2: 限制并发数
    console.log('\n' + '='.repeat(60));
    console.log('📋 示例 2: 限制并发数（3 个）\n');
    const result2 = await crawlWithLimit(testUrls, 3);
    displayStats(result2.results);

    // 示例 3: 分批处理
    console.log('\n' + '='.repeat(60));
    console.log('📋 示例 3: 分批处理（每批 3 个）\n');
    const result3 = await crawlInBatches(testUrls, 3);
    displayStats(result3.results);

    // 示例 4: 带进度显示
    console.log('\n' + '='.repeat(60));
    console.log('📋 示例 4: 带进度显示\n');
    const result4 = await crawlWithProgress(testUrls, 3);
    displayStats(result4.results);

    // 性能对比
    console.log('\n' + '='.repeat(60));
    console.log('⚡ 性能对比:\n');
    console.log(`  无限制并发: ${result1.duration}秒`);
    console.log(`  限制并发(3): ${result2.duration}秒`);
    console.log(`  分批处理(3): ${result3.duration}秒`);
    console.log(`  带进度显示:  ${result4.duration}秒`);
  } catch (error) {
    console.error('程序执行失败:', error.message);
  }
};

main();
