import React from 'react'

export default class App extends React.Component {
  state = {
    show: false
  }
  onChange = e => {}
  render() {
    return (
      <div>
        <h1>FaceVerify</h1>
        <div>
          <a
            href={`laifenqi://openapp?url=${'https://wx0000.cloudauth.alibaba.com/h5/h5verify.html?token=36032b9891c24c298b4d098d6c129e0d&tokenSource=getVerifyToken&successRedirect=http%3A%2F%2Flfqshop.lfqstandard.test3.qudian.com%2Fv3%2Funion%2Ftrust%2Fresult%2F%3Fquery%3Dresult%3Dwaitandsymbolticket%3D%7BCFD9552C-4A25-6206-2EC9-E48A3C7484EB%7D&failRedirect=http%3A%2F%2Flfqshop.lfqstandard.test3.qudian.com%2Fv3%2Funion%2Ftrust%2Fresult%2F%3Fquery%3Dresult%3Dfailandsymbolticket%3D%7BCFD9552C-4A25-6206-2EC9-E48A3C7484EB%7D#/biometricVideo'}`}
          >
            阿里云
          </a>
        </div>
        <br />
        <div>
          <a
            href={`laifenqi://openapp?url=${encodeURIComponent(
              'https://ida.webank.com/s/web/h5/#/action/entry'
            )}`}
          >
            腾讯云人脸
          </a>
        </div>
        <b />
        <div>
          <a
            href={`laifenqi://openapp?url=${encodeURIComponent(
              'https://ai.baidu.com/face-verify/mobile.html'
            )}`}
          >
            百度云活体检测
          </a>
        </div>
      </div>
    )
  }
}
