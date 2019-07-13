// Set the name of the hidden property and the change event for visibility

class VisibilityManager {
  constructor () {
    if (typeof document.hidden !== 'undefined') {
      // Opera 12.10 and Firefox 18 and later support
      this.hidden = 'hidden'
      this.visibilityChange = 'visibilitychange'
    } else if (typeof document.msHidden !== 'undefined') {
      // this.hidden = 'msHidden'
      // this.visibilityChange = 'msvisibilitychange'
    } else if (typeof document.webkitHidden !== 'undefined') {
      // this.hidden = 'webkitHidden'
      // this.visibilityChange = 'webkitvisibilitychange'
    }
    this.initEventHandler()
  }
  tasks = []
  get invalid () {
    return (
      typeof document.addEventListener === 'undefined' ||
      this.hidden === undefined
    )
  }
  get runingTasks () {
    return this.tasks.filter(({ pause }) => !pause)
  }

  add (task) {
    this.tasks.push(task)
  }
  initEventHandler () {
    if (!this.invalid) {
      document.addEventListener(
        this.visibilityChange,
        this.handleVisibilityChange
      )
    }
  }

  handleVisibilityChange = () => {
    if (!document[this.hidden]) {
      this.runingTasks.forEach(task => {
        task.handler()
      })
    }
  }
}

export class Task {
  constructor (handler, pause = false, context) {
    this.handler = handler
    this.pause = pause
    if (context) this.handler = this.handler.bind(context)
  }
}

export default new VisibilityManager()
