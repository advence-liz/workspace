let Tween = Hilo.Tween //缓动动画
export default class Bird extends Hilo.Bitmap {
  //导出 Bird 这个类 这个类继承Hilo.Bitmap
  constructor(props) {
    super(props)
    this.on(Hilo.event.POINTER_START, function(e) {
      e.preventDefault()
      // currentEvent = e.changedTouches[0].identifier
      // startTouchXList[currentEvent] = e.changedTouches[0].clientX
      // startTouchYList[currentEvent] = e.changedTouches[0].clientY
      // endTouchXList[currentEvent] = e.changedTouches[0].clientX
      // endTouchYList[currentEvent] = e.changedTouches[0].clientY
      this.bigger()
    })
  }

  //放大方法
  bigger(index = 0) {
    //Tween.to创建一个缓动动画，让当前可视对象从当前属性（scaleX: .2,scaleY: .2）变换到目标属性（scaleX: 1.4, scaleY: 1.4）
    return Tween.to(
      this,
      { width: 400, height: 400 },
      {
        duration: 500, //完成这个变换的时长
        delay: 500 * index
      }
    ).link(
      Tween.to(
        this,
        { width: 200, height: 200 },
        {
          duration: 500,
          delay: '+0'
        }
      )
    )
  }
}
