const { ROOT } = require('./test/config')
const path = require('path')
const xlsx = require('node-xlsx')

/**
 * 对比当前周相对上周的变化  68.2%
 *
 * 当前打开率均值  A
 * 1. 上周大于 A  增大减少包括下线
 * 2. 上周小于 A  增加或减少
 * 3. 本周新增活动大于 A
 * 4. 本周新增活动小于 A
 */

function parse(excelFilePath) {
    /**
[
  {
    "name": "Sheet1",
    "data": [
      ["Serial 1", "Serial 2", "Serial 3", "UPC", "PO#", "Date Received"], // 表头
      ["SPKA19BD170C53", "SPKA19BD170420", "SPKA19BD1707F3", "861453000227", "10012", "5/25/17"],
      ["SPKA19BD16007A", "SPKA19BD170927", "SPKA19BD1702B9", "861453000227", "10012", "5/25/17"]
    ]
  }
]

 */
    //解析excel, 获取到所有sheets
    const sheets = xlsx.parse(path.join(ROOT, excelFilePath))

    // 查看页面数
    console.log(sheets.length)

    // 打印页面信息..
    const sheet = sheets[0]
    const head = sheet.data[0]

    let data = sheet.data.filter((item, index) => {
        if (index === 0) return false //过滤表头
        return item[1] === 'android'
    })
    data.sort((x, y) => {
        y[7] - x[7]
    })
    let body = data.slice(0, 15)

    let tables = [head, ...body]
    // [
    //     '活动 id',  0   '设备类型',1
    //     '资源曝光 UV',2  '资源点击 UV',3
    //     '资源位点击率', 4  '容器加载 UV',5
    //     '容器打开率',  6  '页面曝光 UV',7
    //     '容器>页面打开率' 8, '页面打开率' 9
    //   ]
    tables.map((item, index) => {
        if (index !== 0) {
            for (let fixIndex of [4, 6, 9]) {
                item[fixIndex] = Number(item[fixIndex].toFixed(3))
            }
        }
        // 倒序防止顺序改变误删
        for (let rmIndex of [8, 6, 5, 4, 3, 2]) {
            item.splice(rmIndex, 1) // 移除 容器>页面打开率
        }
    })
    console.table(tables)
    const datas = tables.slice(1)
    const ids = datas.map(item => item[0])
    const result = {
        datas,
        ids
    }

    // console.log(result)
}

module.exports = parse
