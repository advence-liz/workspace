// Options 页面脚本

let customSelectors = [];
let whitelist = [];
let dynamicRules = [];

document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadStats();
  loadRules();

  // 绑定事件
  document.getElementById('addSelector').addEventListener('click', addCustomSelector);
  document.getElementById('addWhitelist').addEventListener('click', addWhitelistDomain);
  document.getElementById('resetStats').addEventListener('click', resetStats);
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  document.getElementById('addRule').addEventListener('click', addRule);

  // 回车键添加
  document.getElementById('customSelector').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addCustomSelector();
  });

  document.getElementById('whitelistDomain').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addWhitelistDomain();
  });

  document.getElementById('rulePattern').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addRule();
  });
});

// 加载设置
function loadSettings() {
  chrome.storage.local.get(['customSelectors', 'whitelist', 'options'], (result) => {
    // 自定义选择器
    if (result.customSelectors) {
      customSelectors = result.customSelectors;
      renderSelectorList();
    }

    // 白名单
    if (result.whitelist) {
      whitelist = result.whitelist;
      renderWhitelistList();
    }

    // 选项
    if (result.options) {
      const options = result.options;
      document.getElementById('blockScripts').checked = options.blockScripts !== false;
      document.getElementById('blockImages').checked = options.blockImages !== false;
      document.getElementById('blockIframes').checked = options.blockIframes !== false;
      document.getElementById('hideEmptySpace').checked = options.hideEmptySpace !== false;
    }
  });
}

// 加载统计
function loadStats() {
  chrome.runtime.sendMessage({ action: 'getStats' }, (stats) => {
    if (stats) {
      document.getElementById('todayCount').textContent = stats.blockedToday || 0;
      document.getElementById('totalCount').textContent = stats.blockedCount || 0;
    }
  });
}

// 添加自定义选择器
function addCustomSelector() {
  const input = document.getElementById('customSelector');
  const selector = input.value.trim();

  if (!selector) {
    showMessage('请输入有效的选择器', 'error');
    return;
  }

  if (customSelectors.includes(selector)) {
    showMessage('该选择器已存在', 'error');
    return;
  }

  customSelectors.push(selector);
  input.value = '';
  renderSelectorList();
  showMessage('选择器已添加', 'success');
}

// 移除自定义选择器
function removeCustomSelector(selector) {
  customSelectors = customSelectors.filter(s => s !== selector);
  renderSelectorList();
  showMessage('选择器已移除', 'success');
}

// 渲染选择器列表
function renderSelectorList() {
  const container = document.getElementById('selectorList');

  if (customSelectors.length === 0) {
    container.innerHTML = '<div class="empty-state">暂无自定义规则</div>';
    return;
  }

  container.innerHTML = customSelectors.map(selector => `
    <div class="selector-item">
      <span class="selector-text">${escapeHtml(selector)}</span>
      <button class="btn-remove" data-selector="${escapeHtml(selector)}">删除</button>
    </div>
  `).join('');

  // 绑定删除按钮
  container.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      removeCustomSelector(e.target.dataset.selector);
    });
  });
}

// 添加白名单域名
function addWhitelistDomain() {
  const input = document.getElementById('whitelistDomain');
  const domain = input.value.trim().toLowerCase();

  if (!domain) {
    showMessage('请输入有效的域名', 'error');
    return;
  }

  if (whitelist.includes(domain)) {
    showMessage('该域名已在白名单中', 'error');
    return;
  }

  whitelist.push(domain);
  input.value = '';
  renderWhitelistList();
  showMessage('域名已添加到白名单', 'success');
}

// 移除白名单域名
function removeWhitelistDomain(domain) {
  whitelist = whitelist.filter(d => d !== domain);
  renderWhitelistList();
  showMessage('域名已从白名单移除', 'success');
}

// 渲染白名单列表
function renderWhitelistList() {
  const container = document.getElementById('whitelistList');

  if (whitelist.length === 0) {
    container.innerHTML = '<div class="empty-state">暂无白名单网站</div>';
    return;
  }

  container.innerHTML = whitelist.map(domain => `
    <div class="selector-item">
      <span class="selector-text">${escapeHtml(domain)}</span>
      <button class="btn-remove" data-domain="${escapeHtml(domain)}">删除</button>
    </div>
  `).join('');

  // 绑定删除按钮
  container.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', (e) => {
      removeWhitelistDomain(e.target.dataset.domain);
    });
  });
}

// 重置统计
function resetStats() {
  if (confirm('确定要重置所有统计数据吗？')) {
    chrome.storage.local.set({
      stats: {
        blockedCount: 0,
        blockedToday: 0,
        lastResetDate: new Date().toDateString()
      }
    }, () => {
      loadStats();
      showMessage('统计数据已重置', 'success');
    });
  }
}

// ==================== 规则管理 ====================

// 加载所有规则
function loadRules() {
  chrome.runtime.sendMessage({ action: 'getAllRules' }, (response) => {
    if (response && response.success) {
      dynamicRules = response.rules || [];
      renderRulesList();
    }
  });
}

// 添加新规则
function addRule() {
  const input = document.getElementById('rulePattern');
  const pattern = input.value.trim();

  if (!pattern) {
    showMessage('请输入有效的规则模式', 'error');
    return;
  }

  // 验证模式格式
  if (!pattern.includes('*') && !pattern.includes('/')) {
    showMessage('规则格式不正确，请包含 * 通配符或使用 /path/* 格式', 'error');
    return;
  }

  chrome.runtime.sendMessage(
    { action: 'addDynamicRule', rule: pattern },
    (response) => {
      if (response && response.success) {
        input.value = '';
        showMessage('规则已添加', 'success');
        loadRules(); // 刷新列表
      } else {
        showMessage('添加失败: ' + (response?.error || '未知错误'), 'error');
      }
    }
  );
}

// 删除规则
function removeRule(ruleId) {
  if (ruleId <= 10000) {
    showMessage('静态规则无法删除', 'error');
    return;
  }

  if (!confirm('确定要删除这条规则吗？')) {
    return;
  }

  chrome.runtime.sendMessage(
    { action: 'removeDynamicRule', ruleId: ruleId },
    (response) => {
      if (response && response.success) {
        showMessage('规则已删除', 'success');
        loadRules(); // 刷新列表
      } else {
        showMessage('删除失败: ' + (response?.error || '未知错误'), 'error');
      }
    }
  );
}

// 切换规则启用状态
function toggleRuleStatus(ruleId, enabled) {
  chrome.runtime.sendMessage(
    { action: 'toggleRule', ruleId: ruleId, enabled: enabled },
    (response) => {
      if (response && response.success) {
        showMessage(enabled ? '规则已启用' : '规则已禁用', 'success');
        loadRules(); // 刷新列表
      } else {
        showMessage('操作失败: ' + (response?.error || '未知错误'), 'error');
      }
    }
  );
}

// 渲染规则列表
function renderRulesList() {
  const container = document.getElementById('rulesList');

  if (!dynamicRules || dynamicRules.length === 0) {
    container.innerHTML = '<div class="empty-state">暂无规则</div>';
    return;
  }

  container.innerHTML = dynamicRules.map(rule => {
    const isStatic = rule.type === 'static';
    const statusClass = rule.enabled ? 'enabled' : 'disabled';
    const statusText = rule.enabled ? '启用' : '禁用';

    return `
      <div class="rule-item ${isStatic ? 'static' : 'dynamic'} ${statusClass}">
        <div class="rule-info">
          <span class="rule-pattern">${escapeHtml(rule.pattern)}</span>
          <span class="rule-type">${isStatic ? '静态' : '动态'}</span>
          <span class="rule-status">${statusText}</span>
        </div>
        <div class="rule-actions">
          ${!isStatic ? `
            <label class="switch-small">
              <input type="checkbox" ${rule.enabled ? 'checked' : ''}
                onchange="window.toggleRuleStatus(${rule.id}, this.checked)">
              <span class="slider-small"></span>
            </label>
            <button class="btn-remove-small" onclick="window.removeRule(${rule.id})">删除</button>
          ` : '<span class="readonly-badge">只读</span>'}
        </div>
      </div>
    `;
  }).join('');
}

// 将函数暴露到全局作用域供 onclick 使用
window.removeRule = removeRule;
window.toggleRuleStatus = toggleRuleStatus;

// 保存设置
function saveSettings() {
  const options = {
    blockScripts: document.getElementById('blockScripts').checked,
    blockImages: document.getElementById('blockImages').checked,
    blockIframes: document.getElementById('blockIframes').checked,
    hideEmptySpace: document.getElementById('hideEmptySpace').checked
  };

  chrome.storage.local.set({
    customSelectors,
    whitelist,
    options
  }, () => {
    showMessage('设置已保存！', 'success');

    // 通知所有标签页更新规则
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, {
          action: 'updateCustomRules',
          selectors: customSelectors
        }).catch(() => {
          // 忽略无法发送消息的标签页
        });
      });
    });
  });
}

// 显示消息
function showMessage(message, type = 'success') {
  const messageEl = document.getElementById('saveMessage');
  messageEl.textContent = message;
  messageEl.style.color = type === 'success' ? '#28a745' : '#dc3545';

  setTimeout(() => {
    messageEl.textContent = '';
  }, 3000);
}

// HTML 转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
