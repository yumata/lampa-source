import Video from '../video'
import Playlist from '../playlist'
import Controller from '../../../core/controller'
import Lang from '../../../core/lang'

let skip_button
let skip_current  = null
let skip_timer    = null
let skip_text_in  = ''
let skip_text_btn = ''
let skip_is_end   = false
let skip_phase    = ''

function init(){
    skip_button = $(`<div class="player-skip selector hide"><span class="player-skip__text"></span><svg><use xlink:href="#sprite-player-next"></use></svg></div>`)

    skip_button.on('hover:enter', skipDo)
}

function texts(e){
    let v   = Video.video()
    let dur = v ? (v.duration || 0) : 0
    let end = dur && e.type == 'skip' && (e.segment.start >= dur * 0.7 || e.segment.end >= dur - 15)

    skip_is_end = Boolean(end)

    if(end){
        skip_text_in  = Lang.translate('player_segments_next_in')
        skip_text_btn = Lang.translate('player_segments_next')
    }
    else{
        skip_text_in  = Lang.translate('player_segments_skip_in')
        skip_text_btn = Lang.translate('player_segments_skip_now')
    }
}

function preview(e){
    if(!skip_button) return

    clearInterval(skip_timer)

    skip_current = e
    skip_phase   = 'preview'

    texts(e)
    previewUpdate(e.starts_in)

    skip_button.removeClass('hide focus').addClass('player-skip--preview')
}

function previewUpdate(seconds){
    if(!skip_button || skip_phase !== 'preview') return

    skip_button.find('.player-skip__text').text(skip_text_in + ' ' + seconds)
}

function active(e){
    if(!skip_button) return

    clearInterval(skip_timer)

    skip_current = e
    skip_phase   = 'active'

    texts(e)
    skip_button.removeClass('player-skip--preview')

    showButton()
}

function showButton(){
    if(!skip_button) return

    clearInterval(skip_timer)

    skip_button.find('.player-skip__text').text(skip_text_btn)
    skip_button.removeClass('hide')

    if(Controller.enabled().name == 'player') Controller.toggle('player_skip')
}

function hide(){
    clearInterval(skip_timer)

    if(skip_button) skip_button.addClass('hide').removeClass('focus player-skip--preview')

    let was  = skip_current
    skip_current = null
    skip_phase   = ''

    if(was && Controller.enabled().name == 'player_skip') Controller.toggle('player')
}

function skipDo(){
    if(skip_phase !== 'active') return

    if(skip_current){
        skip_current.segment.skiped = true

        if(skip_is_end){
            hide()

            Playlist.next()

            return
        }

        Video.to(Math.min(Video.video().duration || skip_current.segment.end, skip_current.segment.end))
    }

    hide()
}

function render(){
    return skip_button
}

export default {
    init,
    render,
    hide,
    preview,
    previewUpdate,
    active,
    do:        skipDo,
    isActive:  () => skip_phase === 'active' && skip_button && !skip_button.hasClass('hide'),
    phase:     () => skip_phase,
    current:   () => skip_current,
    button:    () => skip_button,
}
