import Birds from './birds' //引入可视对象js

export default class Stage extends Hilo.Stage {
  //导出 Stage 这个类 这个类继承Hilo.Stage
  constructor(props) {
    super(props)
    this.init() //初始化
  }

  init() {
    this.birds = new Birds({ y: 20 }).addTo(this)

    // this.bird

    // 鼠标按下放大这个可视对象
    document.addEventListener(Hilo.event.POINTER_START, () => {
      this.birds.bigger()
    })

    //缓动动画
    var Tween = Hilo.Tween
    //设定舞台刷新频率为60fps
    var ticker = new Hilo.Ticker(60)
    // 把舞台加入到tick队列
    ticker.addTick(this)
    //需要把Tween加到ticker里才能使用缓动动画
    ticker.addTick(Tween)
    //启动ticker
    ticker.start()
  }
}
