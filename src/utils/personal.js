let status = false

function init(){
    $.ajax({
        url: "./personal.lampa",
        dataType: 'text',
        success: ()=>{
            status = true
        }
    })
}

function confirm(){
    return status
}

export default {
    init,
    confirm
}