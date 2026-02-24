// 后台服务脚本

// 统计数据
let stats = {
  blockedCount: 0,
  blockedToday: 0,
  lastResetDate: new Date().toDateString()
};

// 初始化
chrome.runtime.onInstalled.addListener(() => {
  console.log(
    '%c[AdBlocker] 广告拦截器已安装 | 版本: 1.0.0',
    'color: #6c5ce7; font-weight: bold; font-size: 14px;'
  );

  // 创建右键菜单
  chrome.contextMenus.create({
    id: 'blockElement',
    title: '拦截此元素',
    contexts: ['all']
  });

  // 加载统计数据
  chrome.storage.local.get(['stats'], (result) => {
    if (result.stats) {
      stats = result.stats;
      checkDateReset();
    }
  });
});

// 监听网络请求（用于统计和日志）
chrome.declarativeNetRequest.onRuleMatchedDebug.addListener((details) => {
  incrementBlockCount();

  const ruleId = details.rule.ruleId;
  const url = details.request.url;
  const type = details.request.type;
  const method = details.request.method;
  const initiator = details.request.initiator || 'N/A';
  const timestamp = new Date().toLocaleTimeString();

  console.log(
    `%c[AdBlocker] 拦截请求 | 时间: ${timestamp}`,
    'color: #ff6b6b; font-weight: bold; font-size: 12px;'
  );
  console.log(
    `%c  规则ID: ${ruleId}\n` +
    `  URL: ${url}\n` +
    `  资源类型: ${type}\n` +
    `  请求方法: ${method}\n` +
    `  来源页面: ${initiator}`,
    'color: #4ecdc4;'
  );

  // 将拦截记录保存到 storage，方便后续查看
  saveBlockedLog({
    ruleId,
    url,
    type,
    method,
    initiator,
    timestamp: Date.now()
  });
});

// 右键菜单点击事件
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'blockElement') {
    // 向 content script 发送消息，选择元素
    chrome.tabs.sendMessage(tab.id, {
      action: 'startElementPicker'
    });
  }
});

// 监听来自 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStats') {
    checkDateReset();
    sendResponse(stats);
  } else if (request.action === 'elementBlocked') {
    incrementBlockCount();
    sendResponse({ success: true });
  } else if (request.action === 'addCustomRule') {
    addCustomRule(request.selector);
    sendResponse({ success: true });
  } else if (request.action === 'getAllRules') {
    getAllRules().then(rules => sendResponse({ success: true, rules }));
    return true;
  } else if (request.action === 'addDynamicRule') {
    addDynamicRule(request.rule).then(result => sendResponse(result));
    return true;
  } else if (request.action === 'removeDynamicRule') {
    removeDynamicRule(request.ruleId).then(result => sendResponse(result));
    return true;
  } else if (request.action === 'toggleRule') {
    toggleRule(request.ruleId, request.enabled).then(result => sendResponse(result));
    return true;
  }
  return true;
});

// 增加拦截计数
function incrementBlockCount() {
  stats.blockedCount++;
  stats.blockedToday++;
  saveStats();
}

// 检查日期是否需要重置
function checkDateReset() {
  const today = new Date().toDateString();
  if (stats.lastResetDate !== today) {
    stats.blockedToday = 0;
    stats.lastResetDate = today;
    saveStats();
  }
}

// 保存统计数据
function saveStats() {
  chrome.storage.local.set({ stats });
}

// 保存拦截日志（最近100条）
function saveBlockedLog(logEntry) {
  chrome.storage.local.get(['blockedLogs'], (result) => {
    const logs = result.blockedLogs || [];
    logs.unshift(logEntry);
    // 只保留最近100条
    if (logs.length > 100) {
      logs.pop();
    }
    chrome.storage.local.set({ blockedLogs: logs });
  });
}

// 添加自定义拦截规则
function addCustomRule(selector) {
  chrome.storage.local.get(['customSelectors'], (result) => {
    const selectors = result.customSelectors || [];
    if (!selectors.includes(selector)) {
      selectors.push(selector);
      chrome.storage.local.set({ customSelectors: selectors });

      // 通知所有标签页更新规则
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            action: 'updateCustomRules',
            selectors: selectors
          });
        });
      });
    }
  });
}

// 监听标签页更新（用于注入脚本）
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // 可以在这里做一些额外的处理
  }
});

// ==================== 动态规则管理 ====================

// 获取所有规则（静态 + 动态）
async function getAllRules() {
  try {
    // 获取静态规则
    const staticRules = await chrome.declarativeNetRequest.getEnabledRulesets();
    let allStaticRules = [];
    for (const ruleset of staticRules) {
      const rules = await chrome.declarativeNetRequest.getDynamicRules();
      // 静态规则从 ruleset 文件加载，这里只获取动态规则
    }

    // 获取动态规则
    const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();

    // 获取会话规则
    const sessionRules = await chrome.declarativeNetRequest.getSessionRules();

    // 构建规则列表
    const rules = [
      // 标记为静态规则（只读）
      { id: 1, pattern: '*doubleclick.net*', type: 'static', enabled: true },
      { id: 2, pattern: '*googlesyndication.com*', type: 'static', enabled: true },
      { id: 3, pattern: '*googleadservices.com*', type: 'static', enabled: true },
      { id: 4, pattern: '*advertising.com*', type: 'static', enabled: true },
      { id: 5, pattern: '*adservice*', type: 'static', enabled: true },
      { id: 6, pattern: '*/ads/*', type: 'static', enabled: true },
      { id: 7, pattern: '*pagead2.googlesyndication.com*', type: 'static', enabled: true },
      { id: 8, pattern: '*adnxs.com*', type: 'static', enabled: true },
      { id: 9, pattern: '*taboola.com*', type: 'static', enabled: true },
      { id: 10, pattern: '*outbrain.com*', type: 'static', enabled: true },
      // 动态规则
      ...dynamicRules.map(r => ({
        id: r.id,
        pattern: r.condition?.urlFilter || r.condition?.regexFilter || '未知',
        type: 'dynamic',
        enabled: !r.condition?.excludedResourceTypes?.length
      }))
    ];

    return rules;
  } catch (error) {
    console.error('获取规则失败:', error);
    return [];
  }
}

// 添加动态规则
async function addDynamicRule(pattern) {
  try {
    // 生成规则ID（从10001开始，避免与静态规则冲突）
    const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
    const newId = dynamicRules.length > 0
      ? Math.max(...dynamicRules.map(r => r.id)) + 1
      : 10001;

    const rule = {
      id: newId,
      priority: 1,
      action: { type: 'block' },
      condition: {
        urlFilter: pattern,
        resourceTypes: ['script', 'xmlhttprequest', 'image', 'sub_frame']
      }
    };

    await chrome.declarativeNetRequest.updateDynamicRules({
      addRules: [rule]
    });

    console.log(
      `%c[AdBlocker] 动态规则已添加 | ID: ${newId}\n  模式: ${pattern}`,
      'color: #00cec9; font-weight: bold; font-size: 12px;'
    );
    return { success: true, ruleId: newId };
  } catch (error) {
    console.error(
      `%c[AdBlocker] 添加规则失败:\n  ${error.message}`,
      'color: #ff7675; font-weight: bold;'
    );
    return { success: false, error: error.message };
  }
}

// 删除动态规则
async function removeDynamicRule(ruleId) {
  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [ruleId]
    });
    console.log(
      `%c[AdBlocker] 动态规则已删除 | ID: ${ruleId}`,
      'color: #e17055; font-weight: bold;'
    );
    return { success: true };
  } catch (error) {
    console.error(
      `%c[AdBlocker] 删除规则失败:\n  ${error.message}`,
      'color: #ff7675; font-weight: bold;'
    );
    return { success: false, error: error.message };
  }
}

// 启用/禁用规则（通过更新规则实现）
async function toggleRule(ruleId, enabled) {
  try {
    if (ruleId <= 10000) {
      // 静态规则无法直接禁用，提示用户
      console.warn(
        `%c[AdBlocker] 无法修改静态规则 ID: ${ruleId}`,
        'color: #fdcb6e; font-weight: bold;'
      );
      return { success: false, error: '静态规则无法禁用，请在设置中管理' };
    }

    const dynamicRules = await chrome.declarativeNetRequest.getDynamicRules();
    const rule = dynamicRules.find(r => r.id === ruleId);

    if (!rule) {
      return { success: false, error: '规则不存在' };
    }

    // 更新规则状态
    const updatedRule = {
      ...rule,
      condition: {
        ...rule.condition,
        excludedResourceTypes: enabled ? [] : ['script', 'xmlhttprequest', 'image', 'sub_frame']
      }
    };

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [ruleId],
      addRules: [updatedRule]
    });

    console.log(
      `%c[AdBlocker] 规则已${enabled ? '启用' : '禁用'} | ID: ${ruleId}`,
      enabled ? 'color: #00b894; font-weight: bold;' : 'color: #636e72; font-weight: bold;'
    );
    return { success: true };
  } catch (error) {
    console.error(
      `%c[AdBlocker] 切换规则状态失败:\n  ${error.message}`,
      'color: #ff7675; font-weight: bold;'
    );
    return { success: false, error: error.message };
  }
}
