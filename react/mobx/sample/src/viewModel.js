import { observable, computed, action } from 'mobx'

const delay = data =>
  new Promise(resolve => {
    setTimeout(resolve, 1000, data)
  })

class ViewModel {
  @observable _data = { v: 1, deep: { v: 1 } }
  @observable test = 1

  @computed get data() {
    return this._data
  }

  @action plus() {
    // const data = yield delay({ text: 'hello word' })
    console.log(this._data.v)
    this._data.v = ++this._data.v
    this._data.deep.v = 3
    this.test = 2
    console.log(this._data)
  }
}

export default new ViewModel()
