/**
 *
 * 图片原始宽高 naturalWidth naturalHeight
 * 设计宽高 clientWidth clientHeight
 *
 * 1. 监控是否使用超过6百万像素 宽 * 高 大于 6000000
 * 2. 图片原始宽高不得超过设计宽高
 */

window.onload = function() {
    var RootFontSize = +getComputedStyle(window.document.documentElement)['font-size'].match(/[^px]+/)[0]
    var RootRatio = RootFontSize / 100
    // RootRatio = RootRatio.toFixed(2)

    var MaxPixel = 6000000

    var Store = []

    function ImageError(image, type) {
        this.type = type
        this.src = image.src
        this.report = function() {
            window.Owl &&
                window.Owl.addError(
                    {
                        name: 'cubeImageLimitError',
                        msg: '图片不符合限定条件'
                    },
                    {
                        level: 'error', // error、warn、info、debug 快速根据异常等级搜索上报日志
                        tags: {
                            type,
                            src: this.src,
                            RootRatio,
                            RootFontSize,
                            screenWidth: window.screen.width
                        }
                    }
                )
        }
    }

    function filterMaxPixel(image) {
        var inValid = image.naturalWidth * image.naturalHeight >= MaxPixel
        if (inValid) {
            Store.push(new ImageError(image, 'MaxPixel'))
        }
    }
    /**
     *
     * 图片原始宽度 / 图片设计宽度 得到的是精准值 比如： 828/750 1.104
     */
    function filterSizeMatch(image) {
        var widthRatio = image.naturalWidth / image.clientWidth
        var heightRatio = image.naturalHeight / image.clientHeight
        // widthRatio = widthRatio.toFixed(2)
        // heightRatio = heightRatio.toFixed(2)
        var inValid = widthRatio > RootRatio || heightRatio > RootRatio
        if (inValid) {
            Store.push(new ImageError(image, 'SizeMatch'))
        }
    }

    var images = document.images

    for (var i = 0; i < images.length; i++) {
        var image = images[i]
        filterMaxPixel(image)
        filterSizeMatch(image)
    }
}
