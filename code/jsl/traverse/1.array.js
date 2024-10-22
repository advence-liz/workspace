
function traverse(arr = [],index){

    if(index === arr.length ){
        return
    }
    console.log(arr[index])

    traverse(arr,index + 1)

    
}

traverse([1,2,3,4,5,6],0)