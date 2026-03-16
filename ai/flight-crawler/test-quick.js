/**
 * 快速测试脚本 - 同步运行
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// 确保截图目录存在
const screenshotDir = path.join(__dirname, 'debug-screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

(async () => {
  console.log('🚀 启动快速测试...');
  const timestamp = Date.now();

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  try {
    await page.setViewport({ width: 375, height: 812 });
    await page.setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15'
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
    console.log(`✅ 初始截图: ${initPath}`);

    // 分析页面
    const pageInfo = await page.evaluate(() => {
      return {
        hasOrigin: document.body.textContent.includes('出发地'),
        has666: document.body.textContent.includes('666'),
        has2666: document.body.textContent.includes('2666'),
        hasQuery: document.body.textContent.includes('查询'),
        title: document.title,
      };
    });

    console.log('📊 页面信息:', JSON.stringify(pageInfo, null, 2));

    // 尝试选择666权益卡
    console.log('🎫 尝试选择 666权益卡航班...');
    const cardTypeClicked = await page.evaluate(() => {
      const allElements = Array.from(document.querySelectorAll('*'));
      for (const el of allElements) {
        const text = el.textContent || '';
        if (text.includes('666权益卡航班')) {
          el.click();
          return true;
        }
      }
      return false;
    });

    console.log(cardTypeClicked ? '✅ 权益卡点击成功' : '❌ 权益卡点击失败');
    await page.waitForTimeout(2000);

    // 最终截图
    const finalPath = path.join(screenshotDir, `${timestamp}-test-final.png`);
    await page.screenshot({ path: finalPath, fullPage: true });
    console.log(`✅ 最终截图: ${finalPath}`);

    console.log('\n✅ 测试完成！');
    console.log(`📁 截图目录: ${screenshotDir}`);

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  } finally {
    await browser.close();
  }
})();
