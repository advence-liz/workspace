import Bird from './brid'
let Tween = Hilo.Tween //缓动动画
export default class Birds extends Hilo.Container {
  //导出 Bird 这个类 这个类继承Hilo.Bitmap
  constructor(props) {
    super(props)

    this.init()
  }

  init() {
    new Bird({
      //实例化可视对象
      image: 'https://api.isoyu.com/uploads/2015/07/mm_380.jpg', //图片
      y: 0, //坐标y
      x: 0, //坐标x
      width: 200,
      height: 200
      // scaleX: 0.2, //缩放比例
      // scaleY: 0.2 //缩放比例
    }).addTo(this) //addTo()添加此对象到父容器
    new Bird({
      //实例化可视对象
      image: 'https://api.isoyu.com/uploads/2015/07/mm_380.jpg', //图片
      y: 200, //坐标y
      x: 0, //坐标x
      width: 200,
      height: 200
    }).addTo(this) //addTo()添加此对象到父容器
    new Bird({
      //实例化可视对象
      image: 'https://api.isoyu.com/uploads/2015/07/mm_380.jpg', //图片
      y: 400, //坐标y
      x: 0, //坐标x
      width: 200,
      height: 200
      // scaleX: 0.2, //缩放比例
      // scaleY: 0.2 //缩放比例
    }).addTo(this) //addTo()添加此对象到父容器
  }
  bigger() {
    this.children.forEach((bird, index) => {
      bird.bigger(index)
    })
  }
}
