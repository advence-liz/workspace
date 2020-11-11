/**
 *
 * 图片原始宽高 naturalWidth naturalHeight
 * 设计宽高 width height   (clientWidth clientHeight 原始隐藏时值为0）
 *
 * 1. 监控是否使用超过6百万像素 宽 * 高 大于 6000000
 * 2. 图片原始宽高不得超过设计宽高
 */

;(function() {
    var DEBUG = false
    try {
        if (window.Block.query.debug) DEBUG = true
    } catch (e) {}

    function imagesWatcher() {
        if (window.screen.width !== 375) return
        // if (parseInt(Math.random() * 10, 10) !== 3) return
        var MaxPixel = 6000000
        var Store = []

        function ImageError(image, type, msg) {
            this.type = type
            this.src = image.src
            this.report = function() {
                var tags = {
                    type,
                    src: this.src,
                    naturalWidth: image.naturalWidth,
                    naturalHeight: image.naturalHeight,
                    width: image.width,
                    height: image.height,
                    widthOffset: image.naturalWidth - image.width,
                    heightOffset: image.naturalHeight - image.height
                }
                if (DEBUG) {
                    console.table(tags)
                }
            }
        }

        function filterMaxPixel(image) {
            var inValid = image.naturalWidth * image.naturalHeight >= MaxPixel
            if (inValid) {
                Store.push(new ImageError(image, 'MaxPixel', '图片超过6百万像素'))
            }
        }
        /**
         *
         * 图片原始宽度 / 图片设计宽度 得到的是精准值 比如： 828/750 1.104
         */
        function filterSizeMatch(image) {
            /**
             * 原始算法为了兼容大屏小屏乘以 RootRatio 但是都会有问题。 image.naturalWidth * RootRatio > image.width || image.naturalHeight * RootRatio > image.height
             * 1. 针对小屏计算会有一些的误差添加一个容错偏移量可以解决。比如根据图片实际尺寸 * RootRatio 计算出来的值是 51.555 而浏览器的自适应的宽度为 52 会自动取整
             * 2. 针对大屏有些图片样式写死的像素值而不是rem 这样式计算乘以 RootRatio 会导致错误统计。
             * 3. 没必要统计大屏和小屏，跳过就好。
             */
            var offset = 1 // 检测留一点偏移buffer
            var widthOffset = image.naturalWidth - image.width
            var heightOffset = image.naturalHeight - image.height
            var inValid = widthOffset > offset || heightOffset > offset
            if (inValid) {
                Store.push(new ImageError(image, 'SizeNotMatch', '图片原始尺寸与设计尺寸不匹配'))
            }
        }

        var images = document.images

        for (var i = 0; i < images.length; i++) {
            var image = images[i]
            if (DEBUG) {
                console.log(image.src)
                console.log('image natural', image.naturalWidth, image.naturalHeight)
                console.log('image width', image.width, image.height)
            }

            filterMaxPixel(image)
            filterSizeMatch(image)
        }

        Store.forEach((item) => item.report())
    }

    if (document.readyState === 'complete') {
        imagesWatcher()
    } else {
        window.addEventListener('load', imagesWatcher)
    }
})()
