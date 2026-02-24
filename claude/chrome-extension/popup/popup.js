// Popup 脚本

document.addEventListener('DOMContentLoaded', () => {
  // 加载统计数据
  loadStats();

  // 加载开关状态
  loadToggleState();

  // 绑定事件
  document.getElementById('enableSwitch').addEventListener('change', handleToggle);
  document.getElementById('pickElement').addEventListener('click', handlePickElement);
  document.getElementById('openOptions').addEventListener('click', handleOpenOptions);
});

// 加载统计数据
function loadStats() {
  chrome.runtime.sendMessage({ action: 'getStats' }, (stats) => {
    if (stats) {
      document.getElementById('blockedToday').textContent = stats.blockedToday || 0;
      document.getElementById('blockedTotal').textContent = stats.blockedCount || 0;
    }
  });
}

// 加载开关状态
function loadToggleState() {
  chrome.storage.local.get(['enabled'], (result) => {
    const enabled = result.enabled !== undefined ? result.enabled : true;
    document.getElementById('enableSwitch').checked = enabled;
  });
}

// 处理开关切换
function handleToggle(e) {
  const enabled = e.target.checked;
  chrome.storage.local.set({ enabled });

  // 这里可以添加启用/禁用拦截的逻辑
  if (enabled) {
    showNotification('广告拦截已启用');
  } else {
    showNotification('广告拦截已禁用');
  }
}

// 处理选择元素
function handlePickElement() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'startElementPicker'
      });
      window.close();
    }
  });
}

// 打开设置页面
function handleOpenOptions() {
  chrome.runtime.openOptionsPage();
}

// 显示通知
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 10px 20px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 1000;
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 2000);
}
