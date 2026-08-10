import Video from '../video'
import Segments from '../segments'
import Html from './html'

/**
 * Отрисовка сегментов на таймлайне плеера
 */
function init(){
    Video.listener.follow('loadeddata', draw)
    
    Segments.listener.follow('set', draw)
}

function draw(){
    let segments = Segments.all()
    let timeline = Html.elem('segments').empty()
    let video    = Video.video()
    let duration = video && video.duration ? video.duration : 0

    for(let name in segments){
        for(let a = 0; a < segments[name].length; a++){
            let seg      = segments[name][a]
            let seg_elem = $(`<div class="player-panel__timeline-segment player-panel__timeline-segment--${name}"></div>`)

            let r_start = Math.min(duration, seg.start)
            let r_end   = Math.min(duration, seg.end)
            
            let start    = duration ? r_start / duration * 100 : 0
            let length   = duration ? (r_end - r_start) / duration * 100 : 0

            seg_elem.css({
                left: duration ? start + '%' : 0,
                width: duration ? length + '%' : 0
            })

            timeline.append(seg_elem)
        }
    }
}

function destroy(){
    Html.elem('segments').empty()
}

export default {
    init,
    destroy
}