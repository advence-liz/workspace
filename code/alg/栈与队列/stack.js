function Stack() {
  this.store = []
  this.push = function(...rest) {
    this.store.push(...rest)
  }
  this.pop = function() {
    this.store.pop()
  }
  this.top = function() {
    return this.store[this.store.length - 1]
  }
}
