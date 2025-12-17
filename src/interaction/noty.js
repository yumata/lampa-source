let html = $('<div class="noty"><div class="noty__body"><div class="noty__text"></div></div></div>'),
    body = html.find('.noty__text'),
    time;

/**
 * Отображает уведомление
 * @param {string} text - текст уведомления
 * @param {Object} [params] - дополнительные параметры
 * @param {string} [params.style] - стиль уведомления, например 'error', 'success' и т.д.
 * @param {number} [params.time=3000] - время отображения уведомления в миллисекундах
 * @returns {void}
 */
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