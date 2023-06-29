

function sizeCheck (str){
    const size = ["S", "XS", "M", "X", "L", "XXL", "XL"]
    if(size.includes(str)){
        return true
    }
    else{
        return false
    }
}

module.exports = { sizeCheck }