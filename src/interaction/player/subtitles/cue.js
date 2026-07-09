import Video from '../video'

let cues_timer

function draw(text, style){
    let cues  = render()
    let inner = $('> div', cues)

    inner.removeClass('bold italic underline')

    if(style) inner.addClass(style)

    inner.html(text ? text : '&nbsp;').css({
        display: text ? 'inline-block' : 'none'
    })

    clearTimeout(cues_timer)

    cues_timer = setTimeout(function(){
        inner.html('&nbsp;').css({
            display: 'none'
        })
    }, 10000)
}

function render(){
    return Video.render().find('.player-video__subtitles')
}

export default {
    draw,
    render
}