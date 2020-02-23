var arr = [1, 2, 3, [4, 5], [6, [7, [8]]],9]

function flattern(arr=[],res=[]){
    
    for(var i =0;i<arr.length;i++){
        if(Array.isArray(arr[i]))  flattern(arr[i],res)
        else res.push(arr[i])
    }

    return  res
}

var r =flattern(arr,[])

console.log(r)