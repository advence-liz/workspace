// ==UserScript==
// @name         广告拦截器
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  智能去除网页广告，提升浏览体验
// @author       Your Name
// @match        *://*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

;(function () {
    'use strict'

    // 常见广告选择器
    const adSelectors = [
        // 通用广告类名
        '.ad',
        '.ads',
        '.advertisement',
        '.banner-ad',
        '[class*="ad-"]',
        '[id*="ad-"]',
        '[class*="advertisement"]',
        '[id*="advertisement"]',

        // 常见广告容器
        '.adsbygoogle',
        '#google_ads_iframe',
        '[class*="google-ad"]',

        // 侧边栏广告
        '.sidebar-ad',
        '.right-ad',
        '.left-ad',

        // 弹窗广告
        '.popup-ad',
        '.modal-ad',
        '.overlay-ad',

        // 视频广告
        '.video-ad',
        '.preroll-ad',

        // 横幅广告
        '.top-banner',
        '.bottom-banner',
        '.header-ad',
        '.footer-ad'
    ]

    // 常见广告域名关键词
    const adDomains = [
        'doubleclick.net',
        'googlesyndication.com',
        'googleadservices.com',
        'advertising.com',
        'adservice.google.com'
    ]

    /**
     * 移除广告元素
     */
    function removeAds() {
        adSelectors.forEach((selector) => {
            try {
                const elements = document.querySelectorAll(selector)
                elements.forEach((el) => {
                    // 检查是否真的是广告（避免误删）
                    if (isLikelyAd(el)) {
                        el.remove()
                        console.log('[ADB] 已移除广告元素:', selector)
                    }
                })
            } catch (e) {
                // 忽略无效选择器
            }
        })
    }

    /**
     * 判断元素是否可能是广告
     */
    function isLikelyAd(element) {
        // 检查元素的文本内容、类名、ID
        const text = element.textContent.toLowerCase()
        const className = element.className.toString().toLowerCase()
        const id = element.id.toLowerCase()

        const adKeywords = ['广告', 'ad', 'advertisement', 'sponsor', '推广']

        return adKeywords.some(
            (keyword) =>
                text.includes(keyword) ||
                className.includes(keyword) ||
                id.includes(keyword)
        )
    }

    /**
     * 拦截广告请求
     */
    function blockAdRequests() {
        // 拦截 fetch
        const originalFetch = window.fetch
        window.fetch = function (...args) {
            const url = args[0]
            if (typeof url === 'string' && isAdUrl(url)) {
                console.log('[ADB] 已拦截广告请求:', url)
                return Promise.reject(new Error('Ad blocked'))
            }
            return originalFetch.apply(this, args)
        }

        // 拦截 XMLHttpRequest
        const originalOpen = XMLHttpRequest.prototype.open
        XMLHttpRequest.prototype.open = function (method, url) {
            if (isAdUrl(url)) {
                console.log('[ADB] 已拦截广告请求:', url)
                return
            }
            return originalOpen.apply(this, arguments)
        }
    }

    /**
     * 判断 URL 是否为广告
     */
    function isAdUrl(url) {
        return adDomains.some((domain) => url.includes(domain))
    }

    /**
     * 监听 DOM 变化，动态移除新增的广告
     */
    function observeDOMChanges() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        // 元素节点
                        // 检查新增节点是否为广告
                        adSelectors.forEach((selector) => {
                            try {
                                if (
                                    node.matches &&
                                    node.matches(selector) &&
                                    isLikelyAd(node)
                                ) {
                                    node.remove()
                                    console.log('[ADB] 已移除动态广告')
                                }
                                // 检查子元素
                                const childAds = node.querySelectorAll(selector)
                                childAds.forEach((ad) => {
                                    if (isLikelyAd(ad)) {
                                        ad.remove()
                                    }
                                })
                            } catch (e) {
                                // 忽略错误
                            }
                        })
                    }
                })
            })
        })

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        })
    }

    /**
     * 移除常见的广告脚本
     */
    function removeAdScripts() {
        const scripts = document.querySelectorAll('script[src]')
        scripts.forEach((script) => {
            const src = script.getAttribute('src')
            if (src && isAdUrl(src)) {
                script.remove()
                console.log('[ADB] 已移除广告脚本:', src)
            }
        })
    }

    /**
     * 初始化
     */
    function init() {
        console.log('[ADB] 广告拦截器已启动')

        // 拦截广告请求
        blockAdRequests()

        // 页面加载完成后移除广告
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                removeAds()
                removeAdScripts()
                observeDOMChanges()
            })
        } else {
            removeAds()
            removeAdScripts()
            observeDOMChanges()
        }

        // 定期清理（防止某些延迟加载的广告）
        setInterval(removeAds, 3000)
    }

    // 启动脚本
    init()
})()
