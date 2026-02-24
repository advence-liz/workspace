/**
 *  打印"eating", 两秒钟之后打印"meow", 再过两秒之后打印"Kevin"
 */

let cat = new Cat('Kevin')
cat.eat().scream().print()
class cat {
    eat() {
        console.log(eating)

        return this
    }

    scream() {
        setTimeout(() => {
            console.log('meow')
        }, 2000)

        return this
    }

    print() {
        setTimeout(() => {
            console.log('Kevin')
        }, 4000)

        return this
    }
}
