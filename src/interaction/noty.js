let html = $('<div class="noty"><div class="noty__body"><div class="noty__text"></div></div></div>'),
    body = html.find('.noty__text'),
    time;


function show(text){
    clearTimeout(time)

    time = setTimeout(()=>{
        html.removeClass('noty--visible')
    },3000)

    body.html(text)

    html.addClass('noty--visible')
}

function render(){
    return html
}

export default {
    show,
    render
}