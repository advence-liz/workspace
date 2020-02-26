function Queue () {
    this.dataStore = []
    this.enqueue = enqueue     //入队
    this.dequeue = dequeue     //出队
    this.front = front         //查看队首元素
    this.back = back           //查看队尾元素
    this.toString = toString   //显示队列所有元素
    this.clear = clear         //清空当前队列
    this.empty = empty         //判断当前队列是否为空
}
