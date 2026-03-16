/**
 * 直接测试爬虫服务
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 确保截图目录存在
const screenshotDir = path.join(__dirname, '..', 'debug-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
  console.log(`📁 创建截图目录: ${screenshotDir}`);
}

async function testCrawl() {
  console.log('🚀 开始测试爬虫...\n');
  const timestamp = Date.now();
  const origin = '北京';
  const date = '2026-03-16';
  const cardType = '666权益卡航班';
  const cardTypeShort = '666';

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  const page = await browser.newPage();

  try {
    // 设置视口
    await page.setViewport({ width: 375, height: 812 });

    // 设置 User-Agent
    await page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    );

    // 访问页面
    console.log(`📄 访问页面: ${origin} - ${date} - ${cardType}`);
    await page.goto('https://m.hnair.com/hnams/plusMember/ableAirlineQuery', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    await page.waitForTimeout(3000);

    // 初始截图
    const screenshotInitPath = path.join(
      screenshotDir,
      `${timestamp}-${origin}-${date}-${cardTypeShort}-init.png`
    );
    await page.screenshot({ path: screenshotInitPath, fullPage: true });
    console.log(`📸 初始截图: ${screenshotInitPath}\n`);

    // 打印页面信息
    const pageContent = await page.content();
    console.log(`📝 页面包含 "出发地": ${pageContent.includes('出发地')}`);
    console.log(`📝 页面包含 "666": ${pageContent.includes('666')}`);
    console.log(`📝 页面包含 "2666": ${pageContent.includes('2666')}`);
    console.log(`📝 页面包含 "查询": ${pageContent.includes('查询')}\n`);

    // 选择权益卡类型
    console.log(`🎫 尝试选择权益卡类型: ${cardType}`);
    const cardTypeClicked = await page.evaluate((targetCardType) => {
      const allElements = Array.from(document.querySelectorAll('div, span, label, input[type="radio"]'));
      for (const el of allElements) {
        const text = el.textContent || '';
        if (text.includes(targetCardType)) {
          console.log('找到权益卡元素:', text);
          if (el.tagName === 'INPUT') {
            el.click();
            return true;
          }
          const clickTarget = el.closest('label') || el;
          clickTarget.click();
          return true;
        }
      }
      return false;
    }, cardType);

    if (cardTypeClicked) {
      console.log(`✅ 已选择权益卡: ${cardType}`);
      await page.waitForTimeout(1500);
    } else {
      console.log(`⚠️ 未找到权益卡选项: ${cardType}`);
    }

    // 选择出发地
    console.log(`\n🛫 尝试选择出发地: ${origin}`);
    const originSelected = await page.evaluate((cityName) => {
      const allElements = Array.from(document.querySelectorAll('div, span, input, select'));
      for (const el of allElements) {
        const text = el.textContent || el.placeholder || '';
        if (text.includes('出发地') || text.includes('请选择出发')) {
          console.log('找到出发地元素:', text);
          el.click();
          return true;
        }
      }
      return false;
    }, origin);

    if (originSelected) {
      console.log('✅ 点击了出发地选择器');
      await page.waitForTimeout(1000);

      // 输入城市名称
      await page.keyboard.type(origin, { delay: 100 });
      console.log(`⌨️ 输入城市名称: ${origin}`);
      await page.waitForTimeout(1500);

      // 查找并点击匹配的城市选项
      const cityClicked = await page.evaluate((cityName) => {
        const allElements = Array.from(document.querySelectorAll('div, li, span, a'));
        for (const el of allElements) {
          const text = el.textContent || '';
          if (text.trim() === cityName || text.includes(cityName)) {
            console.log('找到城市选项:', text);
            el.click();
            return true;
          }
        }
        return false;
      }, origin);

      if (cityClicked) {
        console.log(`✅ 已选择出发地: ${origin}`);
        await page.waitForTimeout(1000);
      } else {
        console.log(`⚠️ 未找到城市选项: ${origin}`);
      }
    } else {
      console.log('⚠️ 未找到出发地选择器');
    }

    // 操作后截图
    const screenshotPath = path.join(
      screenshotDir,
      `${timestamp}-${origin}-${date}-${cardTypeShort}-after.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`\n📸 操作后截图: ${screenshotPath}`);

    // 点击查询按钮
    console.log('\n🔍 尝试点击查询按钮');
    const queryClicked = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('button, div, span, a'));
      for (const el of allElements) {
        const text = el.textContent || '';
        if (text.includes('查询航班') || text.includes('查询')) {
          console.log('找到查询按钮:', text);
          el.click();
          return true;
        }
      }
      return false;
    });

    if (queryClicked) {
      console.log('✅ 点击查询按钮成功');
      await page.waitForTimeout(3000);
    } else {
      console.log('⚠️ 未找到查询按钮');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 测试完成！');
    console.log('='.repeat(60));
    console.log(`\n📁 截图保存在: ${screenshotDir}`);
    console.log(`\n请查看以下文件：`);
    console.log(`  - ${path.basename(screenshotInitPath)} (初始状态)`);
    console.log(`  - ${path.basename(screenshotPath)} (操作后状态)\n`);

  } catch (error) {
    console.error('\n❌ 测试失败:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

testCrawl().catch(console.error);
