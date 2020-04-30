const gulp = require('gulp')
const glob = require('glob')
const fs = require('fs')
const path = require('path')
const del = require('del')
const srcPath = path.resolve(__dirname, 'src')
const distPath = path.resolve(__dirname, 'dist')

function getMergeTask() {
    const times = new Date().getTime()
    const expireTimes = 3 * 86400000 // 3 day
    // 遍历目录
    let dirs = glob.sync(path.join(srcPath, '!(*.*)')).map(dir => {
        const stat = fs.statSync(dir)
        const { birthtimeMs, birthtime } = stat
        return { dirPath: dir, birthtime, birthtimeMs }
    })
    // 删除过期目录
    dirs = dirs.filter(dir => {
        const isValid = !(times - dir.birthtimeMs > expireTimes)
        if (!isValid) {
            del(dir.dirPath).then(() => {
                console.log('del', dir.dirPath)
            })
        }
        return isValid
    })
    // 根据时间排序有效目录
    dirs = dirs.sort(function(m, n) {
        return m.birthtimeMs > n.birthtimeMs
    })
    // 生成merge task
    dirs = dirs.map(({ dirPath }) => {
        const merge = function() {
            return gulp
                .src(path.join(dirPath, '**', '*'))
                .pipe(gulp.dest(distPath))
        }
        merge.displayName = `merge:${path.parse(dirPath).name}`
        return merge
    })
    return dirs
}

const tasks = getMergeTask()

module.exports = {
    mergeTask: gulp.series(...tasks)
}

/**
 * 1 遍历目录
 * 3 删除过期目录
 * 4 根据时间排序有效目录
 * 5 循环合并
 */
