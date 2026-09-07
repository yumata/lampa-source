let html,text
let processing = []

/**
 * Инициализирует слой прогресса обработки
 * @returns {void}
 */
function init(){
    html = $('<div class="processing hide"><div><div class="processing__loader"></div><div class="processing__text"></div></div></div>')
    text = html.find('.processing__text')

    update()
}

/**
 * Обновляет слой прогресса обработки
 * @returns {void}
 */
function update(){
    if(processing.length){
        text.text(processing.length > 1 ? processing.length : '1 / ' + Math.round(processing[0].percent) + '%')

        let complete = processing.find(a=>a.percent >= 100)

        if(complete) Lampa.Arrays.remove(processing, complete)

        requestAnimationFrame(update)
    }
    else html.addClass('hide')
}

/**
 * Добавляет процесс обработки
 * @param {string} id - уникальный идентификатор процесса
 * @param {number} percent - процент выполнения процесса (0-100)
 * @returns {void}
 */
function push(id, percent){
    let find = processing.find(a=>a.id == id)

    if(!find){
        processing.push({
            id: id,
            percent: percent,
            start: Date.now()
        })

        html.removeClass('hide')

        update()
    }
    else find.percent = percent
}

/**
 * Возвращает HTML слой прогресса обработки
 * @param {boolean} [js=false] - возвращать как JS объект или jQuery
 * @returns {jQuery|HTMLElement}
 */
function render(js){
    return js ? html[0] :html
}

export default {
    init,
    push,
    render
}