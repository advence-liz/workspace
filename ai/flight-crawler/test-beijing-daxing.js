const puppeteer = require('./backend/node_modules/puppeteer');

(async () => {
  console.log('🚀 启动浏览器...');
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100  // 放慢操作速度，便于观察
  });
  const page = await browser.newPage();

  // 设置移动端视口
  await page.setViewport({ width: 375, height: 812 });

  // 设置 User-Agent
  await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
  );

  console.log('📱 访问页面...');
  await page.goto('https://m.hnair.com/hnams/plusMember/ableAirlineQuery', {
    waitUntil: 'networkidle2',
    timeout: 30000,
  });

  console.log('✅ 页面加载完成');
  await page.waitForTimeout(2000);

  // 选择666权益卡
  console.log('🎫 选择666权益卡...');
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

  // 截图：初始状态
  await page.screenshot({ path: '/tmp/daxing-01-init.png', fullPage: true });
  console.log('📸 截图已保存: /tmp/daxing-01-init.png');

  // 点击出发地
  console.log('🛫 点击出发地...');
  await page.click('.dep-box');
  await page.waitForTimeout(500);

  // 截图：出发地输入框打开
  await page.screenshot({ path: '/tmp/daxing-02-dep-box-opened.png', fullPage: true });
  console.log('📸 截图已保存: /tmp/daxing-02-dep-box-opened.png');

  // 输入"北京大兴"
  console.log('⌨️  输入"北京大兴"...');
  await page.keyboard.type('北京大兴');
  await page.waitForTimeout(1500);

  // 截图：输入后的下拉列表
  await page.screenshot({ path: '/tmp/daxing-03-after-input.png', fullPage: true });
  console.log('📸 截图已保存: /tmp/daxing-03-after-input.png');

  // 获取所有候选项
  console.log('\n📋 分析下拉列表中的所有候选项:');
  const candidates = await page.evaluate(() => {
    const items = document.querySelectorAll('li, div[class*="item"]');
    const results = [];

    for (const item of items) {
      const text = (item.textContent || '').trim();
      if (text && text.length > 0 && text.length < 100) {
        results.push({
          text: text,
          className: item.className,
          tagName: item.tagName,
          isVisible: item.offsetParent !== null
        });
      }
    }

    return results;
  });

  console.log('\n所有候选项:');
  candidates.forEach((item, index) => {
    if (item.isVisible && item.text.includes('北京')) {
      console.log(`  ${index + 1}. [${item.tagName}] ${item.text}`);
      console.log(`     类名: ${item.className}`);
      console.log(`     可见: ${item.isVisible ? '是' : '否'}`);
    }
  });

  // 尝试选择"北京大兴"
  console.log('\n🎯 尝试选择"北京大兴"...');
  const citySelected = await page.evaluate((cityName) => {
    const items = document.querySelectorAll('li, div[class*="item"]');
    console.log(`查找城市: ${cityName}`);

    // 策略1: 精确匹配
    for (const item of items) {
      const text = (item.textContent || '').trim();
      console.log(`检查项: ${text}`);

      if (text === cityName) {
        console.log(`✓ 精确匹配: ${text}`);
        item.click();
        return { success: true, method: 'exact', text: text };
      }
    }

    // 策略2: 包含匹配（但要避免选到"北京首都"）
    for (const item of items) {
      const text = (item.textContent || '').trim();

      if (text.includes(cityName) && !text.includes('首都')) {
        console.log(`✓ 包含匹配: ${text}`);
        item.click();
        return { success: true, method: 'contains', text: text };
      }
    }

    // 策略3: 宽松匹配（包含"大兴"）
    for (const item of items) {
      const text = (item.textContent || '').trim();

      if (text.includes('大兴')) {
        console.log(`✓ 大兴匹配: ${text}`);
        item.click();
        return { success: true, method: 'daxing', text: text };
      }
    }

    return { success: false, method: 'none', text: '' };
  }, '北京大兴');

  console.log(`\n选择结果: ${JSON.stringify(citySelected, null, 2)}`);
  await page.waitForTimeout(1000);

  // 截图：选择后
  await page.screenshot({ path: '/tmp/daxing-04-after-select.png', fullPage: true });
  console.log('📸 截图已保存: /tmp/daxing-04-after-select.png');

  // 检查出发地是否已设置
  const selectedCity = await page.evaluate(() => {
    const depBox = document.querySelector('.dep-box');
    return depBox ? depBox.textContent.trim() : '';
  });

  console.log(`\n✅ 当前出发地: ${selectedCity}`);

  // 点击查询按钮
  console.log('\n🔍 点击查询按钮...');
  await page.click('.query-btn');
  await page.waitForTimeout(3000);

  // 截图：查询结果
  await page.screenshot({ path: '/tmp/daxing-05-result.png', fullPage: true });
  console.log('📸 截图已保存: /tmp/daxing-05-result.png');

  // 检查页面状态
  const pageState = await page.evaluate(() => {
    const body = document.body;
    const bodyText = body.textContent || '';

    return {
      hasNoDataText: bodyText.includes('暂时没有可预订的航班'),
      hasFlightData: document.querySelectorAll('.flight-list > *, .list-item').length > 0,
      bodyTextSample: bodyText.substring(0, 300),
    };
  });

  console.log('\n📊 页面状态:');
  console.log(`  - 无数据提示: ${pageState.hasNoDataText ? '是' : '否'}`);
  console.log(`  - 有航班数据: ${pageState.hasFlightData ? '是' : '否'}`);
  console.log(`  - 页面文本预览: ${pageState.bodyTextSample}`);

  console.log('\n⏳ 等待30秒供查看...');
  await page.waitForTimeout(30000);

  await browser.close();
  console.log('\n✅ 测试完成！');
  console.log('\n📸 截图文件位置:');
  console.log('  1. /tmp/daxing-01-init.png - 初始状态');
  console.log('  2. /tmp/daxing-02-dep-box-opened.png - 出发地输入框打开');
  console.log('  3. /tmp/daxing-03-after-input.png - 输入"北京大兴"后');
  console.log('  4. /tmp/daxing-04-after-select.png - 选择后');
  console.log('  5. /tmp/daxing-05-result.png - 查询结果');
})();
