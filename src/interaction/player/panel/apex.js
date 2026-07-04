import Panel from '../panel'

function push(side, html){
    Panel.render().find('.player-panel__apex-' + side + '-side').prepend(html)
}

function render(side){
    return Panel.render().find('.player-panel__apex-' + side + '-side')
}

export default {
    push,
    render
}