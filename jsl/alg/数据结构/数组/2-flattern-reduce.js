var arr = [1, 2, 3, [4, 5], [6, [7, [8]]], 9]

function flattern(arr = []) {

    return   arr.reduce((pre, cur) => {
        if (Array.isArray(cur)) {
            pre.push(...flattern(cur))
            // return pre
        } 
        else {
            pre.push(cur)
            // return pre
        }
        return pre
           
       
    }, [])

}

var r = flattern(arr)

console.log(r)