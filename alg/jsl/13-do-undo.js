class Redo {
    constructor() {
        this.past = []
        this.present = null
        this.future = []
        this.preState = 0
    }
    do(state) {
        this.past.push(this.preState)
        this.present = state
        this.preState = state
        this.log()
    }
    undo() {
        this.future.unshift(this.present)
        this.present = this.past.pop()
        this.log()
    }

    redo() {
        this.past.push(this.present)
        this.present = this.future.shift()
        this.log()
    }
    log() {
        console.log('past', this.past)
        console.log('present', this.present)
        console.log('future', this.future)
        console.log('--------------------------')
    }
}

let redo = new Redo()

redo.do(1)

redo.do(2)
redo.do(3)
redo.undo()

redo.redo()
