// 内容脚本 - 在网页中运行

// 常见广告选择器
const adSelectors = [
    '.ad',
    '.ads',
    '.advertisement',
    '.banner-ad',
    '.adsbygoogle',
    '#google_ads_iframe',
    '[class*="google-ad"]',
    '.sidebar-ad',
    '.right-ad',
    '.left-ad',
    '.popup-ad',
    '.modal-ad',
    '.overlay-ad',
    '.video-ad',
    '.preroll-ad',
    '.top-banner',
    '.bottom-banner',
    '.header-ad',
    '.footer-ad',
    'iframe[src*="doubleclick"]',
    'iframe[src*="googlesyndication"]',
    'iframe[src*="advertising"]'
]

// 自定义选择器
let customSelectors = []

// 元素选择器状态
let pickerMode = false
let hoverElement = null
let highlightDiv = null

// 初始化
function init() {
    console.log('[ADB] 插件已加载')

    // 加载自定义规则
    loadCustomRules()

    // 移除广告
    removeAds()

    // 监听 DOM 变化
    observeDOMChanges()

    // 创建高亮框
    createHighlightDiv()
}

// 加载自定义规则
function loadCustomRules() {
    chrome.storage.local.get(['customSelectors'], (result) => {
        if (result.customSelectors) {
            customSelectors = result.customSelectors
            removeAds()
        }
    })
}

// 移除广告元素
function removeAds() {
    const allSelectors = [...adSelectors, ...customSelectors]
    let removedCount = 0
    const timestamp = new Date().toLocaleTimeString()

    allSelectors.forEach((selector) => {
        try {
            const elements = document.querySelectorAll(selector)
            elements.forEach((el) => {
                if (isLikelyAd(el)) {
                    const elInfo = {
                        tag: el.tagName,
                        class: el.className?.toString() || 'N/A',
                        id: el.id || 'N/A',
                        src: el.src || el.href || 'N/A',
                        text: el.textContent?.substring(0, 50) || 'N/A'
                    }

                    console.log(
                        `%c[AdBlocker] 移除DOM元素 | 时间: ${timestamp}`,
                        'color: #ff9f43; font-weight: bold; font-size: 12px;'
                    )
                    console.log(
                        `%c  选择器: ${selector}\n` +
                        `  标签: ${elInfo.tag}\n` +
                        `  Class: ${elInfo.class}\n` +
                        `  ID: ${elInfo.id}\n` +
                        `  链接: ${elInfo.src}\n` +
                        `  文本: ${elInfo.text}`,
                        'color: #a29bfe;'
                    )

                    el.remove()
                    removedCount++
                }
            })
        } catch (e) {
            // 忽略无效选择器
        }
    })

    if (removedCount > 0) {
        console.log(
            `%c[AdBlocker] 本次共移除 ${removedCount} 个广告元素`,
            'color: #00b894; font-weight: bold;'
        )
        // 通知后台更新统计
        chrome.runtime.sendMessage({
            action: 'elementBlocked'
        })
    }
}

// 判断元素是否可能是广告
function isLikelyAd(element) {
    const text = element.textContent?.toLowerCase() || ''
    const className = element.className?.toString().toLowerCase() || ''
    const id = element.id?.toLowerCase() || ''

    const adKeywords = [
        '广告',
        'ad',
        'advertisement',
        'sponsor',
        '推广',
        'promoted'
    ]

    return adKeywords.some(
        (keyword) =>
            text.includes(keyword) ||
            className.includes(keyword) ||
            id.includes(keyword)
    )
}

// 监听 DOM 变化
function observeDOMChanges() {
    const observer = new MutationObserver((mutations) => {
        let needsCleanup = false

        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    needsCleanup = true
                }
            })
        })

        if (needsCleanup) {
            removeAds()
        }
    })

    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    })
}

// 创建高亮框
function createHighlightDiv() {
    highlightDiv = document.createElement('div')
    highlightDiv.style.cssText = `
    position: absolute;
    border: 2px solid #ff0000;
    background-color: rgba(255, 0, 0, 0.1);
    pointer-events: none;
    z-index: 2147483647;
    display: none;
  `
    document.documentElement.appendChild(highlightDiv)
}

// 启动元素选择器
function startElementPicker() {
    pickerMode = true
    document.body.style.cursor = 'crosshair'

    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKeyDown)

    showNotification('请点击要拦截的元素，按 ESC 取消')
}

// 停止元素选择器
function stopElementPicker() {
    pickerMode = false
    document.body.style.cursor = ''
    highlightDiv.style.display = 'none'

    document.removeEventListener('mouseover', handleMouseOver)
    document.removeEventListener('click', handleClick)
    document.removeEventListener('keydown', handleKeyDown)
}

// 鼠标悬停事件
function handleMouseOver(e) {
    if (!pickerMode) return

    e.stopPropagation()
    hoverElement = e.target

    const rect = hoverElement.getBoundingClientRect()
    highlightDiv.style.cssText = `
    position: absolute;
    border: 2px solid #ff0000;
    background-color: rgba(255, 0, 0, 0.1);
    pointer-events: none;
    z-index: 2147483647;
    display: block;
    left: ${rect.left + window.scrollX}px;
    top: ${rect.top + window.scrollY}px;
    width: ${rect.width}px;
    height: ${rect.height}px;
  `
}

// 点击事件
function handleClick(e) {
    if (!pickerMode) return

    e.preventDefault()
    e.stopPropagation()

    if (hoverElement) {
        const selector = generateSelector(hoverElement)

        // 添加到自定义规则
        chrome.runtime.sendMessage(
            {
                action: 'addCustomRule',
                selector: selector
            },
            (response) => {
                if (response.success) {
                    customSelectors.push(selector)
                    console.log(
                        '[ADB] 手动移除元素:',
                        hoverElement.tagName,
                        selector
                    )
                    hoverElement.remove()
                    showNotification(`已添加拦截规则: ${selector}`)
                }
            }
        )
    }

    stopElementPicker()
}

// 键盘事件
function handleKeyDown(e) {
    if (e.key === 'Escape') {
        stopElementPicker()
        showNotification('已取消选择')
    }
}

// 生成 CSS 选择器
function generateSelector(element) {
    if (element.id) {
        return `#${element.id}`
    }

    if (element.className) {
        const classes = element.className
            .toString()
            .split(' ')
            .filter((c) => c)
        if (classes.length > 0) {
            return `.${classes.join('.')}`
        }
    }

    return element.tagName.toLowerCase()
}

// 显示通知
function showNotification(message) {
    const notification = document.createElement('div')
    notification.textContent = message
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #333;
    color: white;
    padding: 15px 20px;
    border-radius: 5px;
    z-index: 2147483647;
    font-size: 14px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  `

    document.body.appendChild(notification)

    setTimeout(() => {
        notification.remove()
    }, 3000)
}

// 监听来自 background 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startElementPicker') {
        startElementPicker()
        sendResponse({ success: true })
    } else if (request.action === 'updateCustomRules') {
        customSelectors = request.selectors
        removeAds()
        sendResponse({ success: true })
    }
    return true
})

// 页面加载完成后初始化
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', init)
// } else {
//     init()
// }
    init()
