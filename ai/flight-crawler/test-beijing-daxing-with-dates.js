const puppeteer = require('./backend/node_modules/puppeteer');

(async () => {
  console.log('🚀 启动浏览器...');
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100
  });
  const page = await browser.newPage();

  await page.setViewport({ width: 375, height: 812 });
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
  await page.screenshot({ path: '/tmp/daxing-dates-01-init.png', fullPage: true });
  console.log('📸 截图已保存: /tmp/daxing-dates-01-init.png');

  // 点击出发地
  console.log('🛫 点击出发地...');
  await page.click('.dep-box');
  await page.waitForTimeout(500);

  // 输入"北京大兴"
  console.log('⌨️  输入"北京大兴"...');
  await page.keyboard.type('北京大兴');
  await page.waitForTimeout(1500);

  // 选择"北京大兴"
  console.log('🎯 选择"北京大兴"...');
  const citySelected = await page.evaluate((cityName) => {
    const items = document.querySelectorAll('li, div[class*="item"]');

    // 策略1: 精确匹配
    for (const item of items) {
      const text = (item.textContent || '').trim();
      if (text === cityName) {
        item.click();
        return { success: true, method: 'exact', text: text };
      }
    }

    // 策略2: 包含匹配（但要避免选到"北京首都"）
    for (const item of items) {
      const text = (item.textContent || '').trim();
      if (text.includes(cityName) && !text.includes('首都')) {
        item.click();
        return { success: true, method: 'contains', text: text };
      }
    }

    // 策略3: 宽松匹配（包含"大兴"）
    for (const item of items) {
      const text = (item.textContent || '').trim();
      if (text.includes('大兴')) {
        item.click();
        return { success: true, method: 'daxing', text: text };
      }
    }

    return { success: false, method: 'none', text: '' };
  }, '北京大兴');

  console.log(`\n选择结果: ${JSON.stringify(citySelected, null, 2)}`);
  await page.waitForTimeout(1000);

  // 截图：选择出发地后
  await page.screenshot({ path: '/tmp/daxing-dates-02-origin-selected.png', fullPage: true });
  console.log('📸 截图已保存: /tmp/daxing-dates-02-origin-selected.png');

  // 测试多个日期
  const testDates = [
    { offset: 1, label: '明天' },
    { offset: 3, label: '3天后' },
    { offset: 7, label: '7天后' },
    { offset: 14, label: '14天后' },
    { offset: 21, label: '21天后' },
  ];

  for (const { offset, label } of testDates) {
    console.log(`\n\n========== 测试日期: ${label} (${offset}天后) ==========`);

    // 点击日期选择器
    console.log('📅 点击日期选择器...');
    await page.click('.date-box, .dep-date, [class*="date"]');
    await page.waitForTimeout(1000);

    // 截图：日期选择器打开
    await page.screenshot({ path: `/tmp/daxing-dates-03-calendar-${offset}days.png`, fullPage: true });
    console.log(`📸 截图已保存: /tmp/daxing-dates-03-calendar-${offset}days.png`);

    // 选择日期（通过计算目标日期）
    console.log(`🗓️  选择日期: ${label}...`);
    const dateSelected = await page.evaluate((daysOffset) => {
      // 计算目标日期
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysOffset);
      const targetDay = targetDate.getDate();

      // 查找日期元素
      const dateElements = document.querySelectorAll('.calendar-day, .date-item, [class*="day"]');

      for (const el of dateElements) {
        const text = (el.textContent || '').trim();
        if (text === String(targetDay)) {
          // 检查是否可点击（不是禁用状态）
          if (!el.classList.contains('disabled') && !el.classList.contains('past')) {
            el.click();
            return { success: true, day: targetDay, text: text };
          }
        }
      }

      return { success: false, day: targetDay, text: '' };
    }, offset);

    console.log(`日期选择结果: ${JSON.stringify(dateSelected, null, 2)}`);
    await page.waitForTimeout(1000);

    // 点击查询按钮
    console.log('🔍 点击查询按钮...');
    await page.click('.query-btn');

    // 智能等待
    console.log('⏳ 智能等待页面加载...');
    await page.waitForTimeout(3000);

    // 检查页面状态
    const pageState = await page.evaluate(() => {
      const body = document.body;
      const bodyText = body.textContent || '';

      // 检查是否包含"暂时没有可预订的航班"等无数据提示
      const hasNoDataText = bodyText.includes('暂时没有可预订的航班') ||
                            bodyText.includes('没有找到') ||
                            bodyText.includes('暂无数据');

      // 检查是否有航班列表容器，且内容不为空
      const flightListElements = document.querySelectorAll('.flight-list > *, .list-item, [class*="flight-item"]');
      const hasFlightData = flightListElements.length > 0;

      return {
        hasFlightData,
        hasNoDataText,
        flightListCount: flightListElements.length,
        bodyTextSample: bodyText.substring(0, 300),
      };
    });

    console.log(`\n📊 页面状态 (${label}):`);
    console.log(`  - 有航班数据: ${pageState.hasFlightData ? '是' : '否'} (${pageState.flightListCount} 个元素)`);
    console.log(`  - 无数据提示: ${pageState.hasNoDataText ? '是' : '否'}`);
    console.log(`  - 页面文本预览: ${pageState.bodyTextSample}`);

    // 截图：查询结果
    await page.screenshot({ path: `/tmp/daxing-dates-04-result-${offset}days.png`, fullPage: true });
    console.log(`📸 截图已保存: /tmp/daxing-dates-04-result-${offset}days.png`);

    // 如果找到数据，提取航班信息
    if (pageState.hasFlightData) {
      console.log('\n🎉 发现航班数据！开始提取...');

      const flights = await page.evaluate(() => {
        const flightItems = document.querySelectorAll('.flight-list > *, .list-item, [class*="flight-item"]');
        const results = [];

        for (const item of flightItems) {
          const text = (item.textContent || '').trim();
          if (text.length > 10) {
            results.push({
              text: text.substring(0, 100),
              className: item.className
            });
          }
        }

        return results;
      });

      console.log(`\n✅ 提取到 ${flights.length} 条航班信息:`);
      flights.slice(0, 3).forEach((flight, index) => {
        console.log(`  ${index + 1}. ${flight.text}`);
      });

      // 找到有数据的日期，等待查看
      console.log(`\n⏳ 找到有数据的日期 (${label})，等待30秒供查看...`);
      await page.waitForTimeout(30000);
      break; // 找到数据后退出循环
    } else if (pageState.hasNoDataText) {
      console.log(`\nℹ️ ${label} 无数据，继续测试下一个日期...`);
    } else {
      console.log(`\n⚠️ ${label} 页面状态未知，继续测试下一个日期...`);
    }

    // 等待2秒后测试下一个日期
    await page.waitForTimeout(2000);
  }

  await browser.close();
  console.log('\n✅ 测试完成！');
  console.log('\n📸 截图文件位置:');
  console.log('  - /tmp/daxing-dates-01-init.png - 初始状态');
  console.log('  - /tmp/daxing-dates-02-origin-selected.png - 选择出发地后');
  console.log('  - /tmp/daxing-dates-03-calendar-*days.png - 日期选择器');
  console.log('  - /tmp/daxing-dates-04-result-*days.png - 查询结果');
})();
