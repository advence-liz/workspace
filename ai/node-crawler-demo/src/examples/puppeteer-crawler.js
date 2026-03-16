/**
 * 示例 3: Puppeteer 爬虫
 * 使用 Puppeteer 爬取需要 JavaScript 渲染的动态网页
 */

import puppeteer from 'puppeteer';

/**
 * 基础 Puppeteer 爬虫
 */
const basicPuppeteerCrawler = async (url) => {
  let browser;

  try {
    console.log('🚀 启动浏览器...');

    // 启动浏览器
    browser = await puppeteer.launch({
      headless: true, // 无头模式（不显示浏览器窗口）
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // 创建新页面
    const page = await browser.newPage();

    // 设置视口大小
    await page.setViewport({ width: 1920, height: 1080 });

    // 设置 User-Agent
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    );

    console.log('📄 正在访问:', url);

    // 访问页面
    await page.goto(url, {
      waitUntil: 'networkidle2', // 等待网络空闲
      timeout: 30000,
    });

    console.log('✅ 页面加载完成');

    // 获取页面标题
    const title = await page.title();

    // 获取页面内容
    const content = await page.content();

    // 执行 JavaScript 获取数据
    const pageData = await page.evaluate(() => {
      return {
        url: window.location.href,
        title: document.title,
        headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(
          (h) => ({
            level: h.tagName,
            text: h.textContent.trim(),
          })
        ),
        links: Array.from(document.querySelectorAll('a[href]'))
          .slice(0, 10)
          .map((a) => ({
            text: a.textContent.trim(),
            href: a.href,
          })),
      };
    });

    console.log('📊 数据提取完成');

    return pageData;
  } catch (error) {
    console.error('❌ 爬取失败:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 浏览器已关闭');
    }
  }
};

/**
 * 截图功能
 */
const takeScreenshot = async (url, outputPath = 'screenshot.png') => {
  let browser;

  try {
    console.log('🚀 启动浏览器进行截图...');

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    console.log('📸 正在访问并截图:', url);
    await page.goto(url, { waitUntil: 'networkidle2' });

    // 截图
    await page.screenshot({
      path: outputPath,
      fullPage: true, // 全页面截图
    });

    console.log('✅ 截图已保存:', outputPath);
  } catch (error) {
    console.error('❌ 截图失败:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

/**
 * 模拟用户交互
 */
const interactiveCrawler = async () => {
  let browser;

  try {
    console.log('🚀 启动浏览器进行交互...');

    browser = await puppeteer.launch({
      headless: false, // 显示浏览器窗口（方便观察）
      args: ['--no-sandbox'],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });

    // 访问示例搜索页面
    console.log('📄 访问 DuckDuckGo 搜索引擎...');
    await page.goto('https://duckduckgo.com', { waitUntil: 'networkidle2' });

    // 在搜索框输入关键词
    console.log('⌨️  输入搜索关键词...');
    await page.type('input[name="q"]', 'Node.js crawler', { delay: 100 });

    // 点击搜索按钮
    console.log('🔍 点击搜索按钮...');
    await page.click('button[type="submit"]');

    // 等待搜索结果加载
    await page.waitForSelector('.results', { timeout: 10000 });

    console.log('⏳ 等待 3 秒查看结果...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // 提取搜索结果
    const results = await page.evaluate(() => {
      const items = document.querySelectorAll('.results .result');
      return Array.from(items)
        .slice(0, 5)
        .map((item) => {
          const title = item.querySelector('.result__title')?.textContent.trim();
          const url = item.querySelector('.result__url')?.textContent.trim();
          const snippet = item.querySelector('.result__snippet')?.textContent.trim();
          return { title, url, snippet };
        });
    });

    console.log('✅ 搜索结果提取完成');
    return results;
  } catch (error) {
    console.error('❌ 交互失败:', error.message);
    throw error;
  } finally {
    if (browser) {
      console.log('⏳ 5 秒后关闭浏览器...');
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await browser.close();
    }
  }
};

/**
 * 等待特定元素出现
 */
const waitForElement = async (url, selector) => {
  let browser;

  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(url, { waitUntil: 'domcontentloaded' });

    console.log(`⏳ 等待元素出现: ${selector}`);
    await page.waitForSelector(selector, { timeout: 10000 });

    console.log('✅ 元素已出现');

    const element = await page.$(selector);
    const text = await page.evaluate((el) => el.textContent, element);

    return text;
  } catch (error) {
    console.error('❌ 等待失败:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// 主函数
const main = async () => {
  console.log('='.repeat(60));
  console.log('Puppeteer 爬虫示例');
  console.log('='.repeat(60));
  console.log();

  try {
    // 示例 1: 基础爬取
    console.log('📋 示例 1: 基础 Puppeteer 爬虫\n');
    const data = await basicPuppeteerCrawler('https://example.com');
    console.log('\n📊 提取的数据:');
    console.log('标题:', data.title);
    console.log('标题数量:', data.headings.length);
    console.log('链接数量:', data.links.length);

    // 示例 2: 截图
    console.log('\n' + '='.repeat(60));
    console.log('📋 示例 2: 网页截图\n');
    await takeScreenshot('https://example.com', './screenshot-example.png');

    // 示例 3: 交互式爬虫（需要用户确认）
    console.log('\n' + '='.repeat(60));
    console.log('📋 示例 3: 模拟用户交互（搜索）\n');
    console.log('⚠️  此示例会打开浏览器窗口，按 Ctrl+C 可跳过\n');

    const searchResults = await interactiveCrawler();
    console.log('\n🔍 搜索结果:');
    searchResults.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.title}`);
      console.log(`   🔗 ${result.url}`);
      console.log(`   📝 ${result.snippet?.substring(0, 100)}...`);
    });
  } catch (error) {
    console.error('程序执行失败:', error.message);
  }
};

main();
