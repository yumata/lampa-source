let html = $('<div class="noty"><div class="noty__body"><div class="noty__text"></div></div></div>'),
    body = html.find('.noty__text'),
    time;


function show(text, params = {}){
    clearTimeout(time)

    html.attr('class', 'noty')

    if(params.style) html.addClass('noty--style--' + params.style)

    time = setTimeout(()=>{
        html.removeClass('noty--visible')
    },params.time || 3000)

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