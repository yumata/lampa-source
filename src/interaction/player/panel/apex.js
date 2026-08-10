import Html from './html'

/**
 * Добавить HTML в панель плеера
 * @param {string} side - Сторона панели ('left', 'right', 'top', 'bottom')
 * @param {string} html - HTML-код для добавления
 */
function push(side, html){
    Html.render().find('.player-panel__apex-' + side + '-side').prepend(html)
}

function render(side){
    return Html.render().find('.player-panel__apex-' + side + '-side')
}

function clear(side){
    Html.render().find('.player-panel__apex-' + side + '-side').empty()
}

function destroy(){
    clear('left')
    clear('right')
    clear('bottom')
    clear('top')
}

export default {
    push,
    render,
    clear,
    destroy
}