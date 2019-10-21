'use strict'
const nodemailer = require('nodemailer')

// async..await is not allowed in global scope, must use a wrapper
async function main() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
//   let testAccount = await nodemailer.createTestAccount()

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: 'smtp.exmail.qq.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user:'lizhuo@qudian.com', // generated ethereal user
      pass: '^&ppA540151' // generated ethereal password
    }
  })

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"自动化测试👻" <lizhuo@qudian.com>', // sender address
    to: 'panyunhao@qudian.com,zhengdandan@qudian.com,lizhuo@qudian.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: `测试url: http://lfqshop.zhengdandan.test5.qudian.com/v3/union/login?_unionApp=changba 测试手机号: 11100000303 2019/10/21-16:05:18 ✅ pass 手机号为空，点击发送验证码，toast提示"请输入正确手机号"

    2019/10/21-16:05:18 ✅ pass 手机号与验证码全空，页面不跳转
    
    2019/10/21-16:05:18 ✅ pass 输入非法的电话号码，点击发送验证码，toast提示"请输入正确手机号"
    
    2019/10/21-16:05:18 ✅ pass 输入错误的验证码，点击登录,页面未跳转
    
    2019/10/21-16:05:18 ✅ pass 登录主流程通过
    
    2019/10/21-16:04:40 测试url: http://lfqshop.zhengdandan.test5.qudian.com/v3/union/login?_unionApp=changba 测试手机号: 11100001701
    
    2019/10/21-16:06:32 ✅ pass 成功绑定银行卡
    
    2019/10/21-16:06:32 ✅ pass 格式错误的银行卡
    
    2019/10/21-16:06:32 ✅ pass 无法识别的银行卡
    
    2019/10/21-16:06:32 ✅ pass 成功补充信息
    
    2019/10/21-16:06:32 ✅ pass 输入格式错误的手机号
    
    2019/10/21-16:06:32 ✅ pass 输入与账户姓名相同的紧急联系人手机
    
    2019/10/21-16:06:32 ✅ pass 输入与账户姓名相同的紧急联系人姓名
    
    2019/10/21-16:06:32 failed 勾选大额资方
    
    2019/10/21-16:06:32 expected true received undefined
    
    2019/10/21-16:05:11 failed 补充地址信息
    
    2019/10/21-16:05:11 expected true received undefined
    
    2019/10/21-16:05:11 failed 绑定支付宝
    
    2019/10/21-16:05:11 expected 1 received undefined
    
    2019/10/21-16:05:11 failed 签约代扣
    
    2019/10/21-16:05:11 expected true received undefined
    
    2019/10/21-16:05:11 failed 设置交易密码
    
    2019/10/21-16:05:11 expected true received undefined
    
    2019/10/21-16:05:11 failed 下单
    
    2019/10/21-16:05:11 expected true received undefined
    
    2019/10/21-16:04:40 测试url: http://lfqshop.zhengdandan.test5.qudian.com/v3/union/login?_unionApp=changba 测试手机号: 11100003599
    
    2019/10/21-16:05:04 ✅ pass 进入还款`, // plain text body
    // html: '<b>Hello world?</b>' // html body
  })

  console.log('Message sent: %s', info.messageId)
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

main().catch(console.error)
