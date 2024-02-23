let status = false

function init(){
    $.get('./personal.lampa',()=>{
        status = true
    })
}

function confirm(){
    return status
}

export default {
    init,
    confirm
}