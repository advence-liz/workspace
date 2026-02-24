# 广告拦截器 - 油猴脚本

一个功能强大的油猴脚本，用于智能去除网页广告，提升浏览体验。

## ✨ 功能特性

- 🚫 **自动移除广告元素** - 通过 CSS 选择器识别并移除常见广告
- 🛡️ **拦截广告请求** - 拦截 fetch 和 XMLHttpRequest 的广告请求
- 👁️ **动态监控** - 使用 MutationObserver 监听 DOM 变化，实时移除新增广告
- 🔍 **智能识别** - 通过关键词匹配，避免误删正常内容
- 🎯 **全站支持** - 适用于所有网站（`@match *://*/*`）

## 📦 安装方法

### 1. 安装油猴插件

首先需要在浏览器中安装油猴（Tampermonkey）扩展：

- **Chrome**: [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojnmkhblfhkeolpgp)
- **Firefox**: [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/)
- **Edge**: [Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
- **Safari**: [Tampermonkey for Safari](https://apps.apple.com/us/app/tampermonkey/id1482490089)

### 2. 安装脚本

1. 点击油猴图标，选择「添加新脚本」
2. 删除默认内容，复制 `ad-blocker.user.js` 的全部代码
3. 粘贴到编辑器中，按 `Ctrl+S`（或 `Cmd+S`）保存
4. 刷新任意网页，脚本即可生效

## 🎯 工作原理

### 1. 广告元素移除
脚本会查找包含以下特征的元素：
- 类名或 ID 包含 `ad`、`advertisement`、`banner` 等关键词
- Google AdSense 相关元素（`.adsbygoogle`）
- 常见广告容器（侧边栏、弹窗、横幅等）

### 2. 请求拦截
拦截向以下域名发起的请求：
- `doubleclick.net`
- `googlesyndication.com`
- `googleadservices.com`
- `advertising.com`

### 3. 动态监控
使用 `MutationObserver` 监听页面变化，实时移除动态加载的广告。

## ⚙️ 自定义配置

### 添加自定义广告选择器

编辑脚本中的 `adSelectors` 数组：

```javascript
const adSelectors = [
    '.ad', '.ads',
    // 添加您自己的选择器
    '.custom-ad-class',
    '#custom-ad-id'
];
```

### 添加广告域名

编辑 `adDomains` 数组：

```javascript
const adDomains = [
    'doubleclick.net',
    // 添加其他广告域名
    'example-ad-network.com'
];
```

### 调整扫描频率

修改定时器间隔（默认 3 秒）：

```javascript
setInterval(removeAds, 3000); // 改为其他值，单位：毫秒
```

## 📝 注意事项

1. **误删风险**：脚本会尽量避免误删正常内容，但某些网站可能会受影响
2. **性能影响**：在复杂页面上可能会有轻微性能开销
3. **兼容性**：适用于现代浏览器（支持 ES6+）
4. **网站兼容**：某些网站可能检测到广告拦截器并要求关闭

## 🔧 调试

打开浏览器控制台（F12），可以看到脚本的运行日志：

```
[ADB] 广告拦截器已启动
[ADB] 已移除广告元素: .ad
[ADB] 已拦截广告请求: https://doubleclick.net/...
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 反馈

如果发现问题或有改进建议，请提交 Issue。
