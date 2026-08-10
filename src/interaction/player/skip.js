import Video from './video'
import Playlist from './playlist'
import Controller from '../../core/controller'
import Lang from '../../core/lang'
import Segments from './segments'
import Storage from '../../core/storage/storage'
import Player from '../player'

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

    Video.listener.follow('timeupdate',(e)=>{
        let near     = Segments.getNear(e.current || 0)
        let user_seg = near && Storage.get('player_segments_' + near.type, 'auto') == 'user' && !near.segment.skiped

        if(user_seg){
            if(near.phase === 'preview'){
                if(!skip_current || skip_current.segment !== near.segment || skip_phase !== 'preview') preview(near)
                else previewUpdate(near.starts_in)
            }
            else if(near.phase === 'inside'){
                if(!skip_current || skip_current.segment !== near.segment || skip_phase !== 'active') active(near)
            }
        }
        else if(skip_current) hide()
    })

    Player.listener.follow('destroy', destroy)
}

function toggle(){
    Controller.add('player_skip',{
        toggle: ()=>{
            if(skip_phase !== 'active') return

            Controller.collectionSet(html)
            Controller.collectionFocus(skip_button[0], html)
        },
        up: Panel.toggle,
        down: Panel.toggle,
        left: Player.toggle,
        right: Player.toggle,
        gone: ()=>{ if(skip_button) skip_button.removeClass('focus') },
        back: Player.close
    })
}

function draw(e){
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

    draw(e)

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

    draw(e)

    skip_button.removeClass('player-skip--preview')

    show()
}

function show(){
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

function destroy(){
    hide()
}

export default {
    init,
    render,
    hide,
    preview,
    toggle,
    previewUpdate,
    active,
    do:        skipDo,
    isActive:  () => skip_phase === 'active' && skip_button && !skip_button.hasClass('hide'),
    phase:     () => skip_phase,
    current:   () => skip_current,
    button:    () => skip_button,
    destroy: destroy
}
