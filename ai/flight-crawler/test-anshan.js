const puppeteer = require('./backend/node_modules/puppeteer');

(async () => {
  console.log('启动浏览器...');
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  // 设置视口
  await page.setViewport({ width: 375, height: 812 });

  // 设置 User-Agent
  await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  );

  console.log('访问页面...');
  await page.goto('https://m.hnair.com/hnams/plusMember/ableAirlineQuery', {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });

  console.log('页面加载完成');
  await page.waitForTimeout(2000);

  // 选择666权益卡
  console.log('选择666权益卡...');
  await page.evaluate(() => {
    const items = document.querySelectorAll('.search-item');
    for (const item of items) {
      if (item.textContent && item.textContent.includes('666权益卡航班')) {
        item.click();
        return;
      }
    }
  });

  await page.waitForTimeout(1000);

  // 点击出发地
  console.log('点击出发地...');
  await page.click('.dep-box');
  await page.waitForTimeout(500);

  // 输入鞍山
  console.log('输入鞍山...');
  await page.keyboard.type('鞍山');
  await page.waitForTimeout(1000);

  // 选择鞍山
  console.log('选择鞍山...');
  const citySelected = await page.evaluate(() => {
    const items = document.querySelectorAll('li, div[class*="item"]');
    for (const item of items) {
      const text = (item.textContent || '').trim();
      console.log(`候选项: ${text}`);
      if (text.includes('鞍山')) {
        console.log(`选中: ${text}`);
        item.click();
        return true;
      }
    }
    return false;
  });

  console.log(`城市选择结果: ${citySelected}`);
  await page.waitForTimeout(1000);

  // 点击查询按钮
  console.log('点击查询按钮...');
  await page.click('.query-btn');

  // 智能等待
  console.log('智能等待页面加载...');
  try {
    const result = await Promise.race([
      page.waitForSelector('.flight-list, .list-item, [class*="flight-item"]', { timeout: 10000 })
        .then(() => 'has-data'),
      page.waitForSelector('.no-data, .empty, [class*="no-data"], [class*="empty"]', { timeout: 10000 })
        .then(() => 'no-data'),
      page.waitForSelector('.error, [class*="error"]', { timeout: 10000 })
        .then(() => 'error'),
      new Promise(resolve => setTimeout(() => resolve('timeout'), 10000))
    ]);
    console.log(`等待结果: ${result}`);
  } catch (error) {
    console.log('等待异常:', error.message);
  }

  await page.waitForTimeout(1000);

  // 检查页面状态
  const pageState = await page.evaluate(() => {
    const body = document.body;
    const bodyText = body.textContent || '';

    return {
      hasFlightList: !!document.querySelector('.flight-list, .list-item, [class*="flight-item"]'),
      hasNoData: !!document.querySelector('.no-data, .empty, [class*="no-data"], [class*="empty"]'),
      hasError: !!document.querySelector('.error, [class*="error"]'),
      bodyTextSample: bodyText.substring(0, 500),
      bodyLength: bodyText.length,
      allClasses: Array.from(document.querySelectorAll('[class]')).slice(0, 20).map(el => el.className)
    };
  });

  console.log('页面状态:', JSON.stringify(pageState, null, 2));

  // 截图
  console.log('保存截图...');
  await page.screenshot({ path: '/tmp/anshan-test.png', fullPage: true });
  console.log('截图已保存到: /tmp/anshan-test.png');

  console.log('等待30秒供查看...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('完成');
})();
