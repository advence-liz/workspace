/**
 * 单次爬虫测试脚本
 * 用于调试页面交互逻辑
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 确保截图目录存在
const screenshotDir = path.join(__dirname, 'debug-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
  console.log(`📁 创建截图目录: ${screenshotDir}`);
}

async function testCrawl() {
  console.log('🚀 启动测试爬虫...');
  const timestamp = Date.now();

  const browser = await puppeteer.launch({
    headless: false, // 显示浏览器窗口，方便调试
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

  const page = await browser.newPage();

  try {
    // 设置视口
    await page.setViewport({ width: 375, height: 812 });

    // 设置 User-Agent
    await page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    );

    console.log('📄 访问页面...');
    await page.goto('https://m.hnair.com/hnams/plusMember/ableAirlineQuery', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    await page.waitForTimeout(3000);

    // 初始截图
    const initPath = path.join(screenshotDir, `${timestamp}-test-init.png`);
    await page.screenshot({ path: initPath, fullPage: true });
    console.log(`📸 初始截图已保存: ${initPath}`);

    // 分析页面结构
    const pageInfo = await page.evaluate(() => {
      const info = {
        hasOrigin: document.body.textContent.includes('出发地'),
        has666: document.body.textContent.includes('666'),
        has2666: document.body.textContent.includes('2666'),
        hasQuery: document.body.textContent.includes('查询'),
        radioButtons: Array.from(document.querySelectorAll('input[type="radio"]')).length,
        inputs: Array.from(document.querySelectorAll('input')).length,
        selects: Array.from(document.querySelectorAll('select')).length,
      };
      return info;
    });

    console.log('📊 页面信息:', JSON.stringify(pageInfo, null, 2));

    // 尝试选择666权益卡
    console.log('🎫 尝试选择 666权益卡航班...');
    const cardTypeClicked = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      for (const el of allElements) {
        const text = el.textContent || '';
        if (text.includes('666权益卡航班')) {
          console.log('找到权益卡元素:', text.substring(0, 50));
          el.click();
          return true;
        }
      }
      return false;
    });

    console.log(cardTypeClicked ? '✅ 权益卡点击成功' : '❌ 权益卡点击失败');
    await page.waitForTimeout(2000);

    // 中间截图
    const afterCardPath = path.join(screenshotDir, `${timestamp}-test-after-card.png`);
    await page.screenshot({ path: afterCardPath, fullPage: true });
    console.log(`📸 选择权益卡后截图: ${afterCardPath}`);

    // 尝试选择出发地
    console.log('🛫 尝试选择出发地...');
    const originClicked = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      for (const el of allElements) {
        const text = el.textContent || (el as any).placeholder || '';
        if (text.includes('出发地') || text.includes('请选择出发')) {
          console.log('找到出发地元素:', text.substring(0, 50));
          el.click();
          return true;
        }
      }
      return false;
    });

    console.log(originClicked ? '✅ 出发地点击成功' : '❌ 出发地点击失败');

    if (originClicked) {
      await page.waitForTimeout(1000);
      await page.keyboard.type('北京', { delay: 100 });
      console.log('⌨️ 输入: 北京');
      await page.waitForTimeout(2000);

      // 最终截图
      const finalPath = path.join(screenshotDir, `${timestamp}-test-final.png`);
      await page.screenshot({ path: finalPath, fullPage: true });
      console.log(`📸 最终截图: ${finalPath}`);
    }

    console.log('✅ 测试完成！请查看截图文件。');
    console.log('💡 提示：浏览器窗口将保持打开30秒，方便查看页面状态。');

    // 保持浏览器打开30秒
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ 测试失败:', error);
  } finally {
    await browser.close();
  }
}

testCrawl();
