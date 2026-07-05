import Html from './html'

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
    clear('center')
}

export default {
    push,
    render,
    clear,
    destroy
}