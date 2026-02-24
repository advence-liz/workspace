class EventEmiter {
    constructor() {
        this.events = []
    }

    on(type, callback) {
        // if(this.events[type]){

        // }

        callbacks = this.events[type] || []

        callbacks.push(callback)
        this.events[type] = callback
    }

    emit(type, ...args) {
        let callbacks = this.events[type]

        for (let callback of callbacks) {
            callbacks(...args)
        }
    }
}
