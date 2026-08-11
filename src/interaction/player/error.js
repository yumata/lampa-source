import Video from './video'
import TVNoise from '../../utils/tvnoise'

let noise

function init(){
    Video.listener.follow('error',(e)=>{
        if(e.fatal){
            destroy()

            create(e.error)
        }
    })

    // Если видео загрузилось, то шум убираем
    Video.listener.follow('loadeddata', destroy)

    Video.listener.follow('destroy', destroy)
}

function create(text){
    noise = {}

    noise.html = $(`<div class="player-video__noise">
        <canvas class="player-video__noise-canvas" width="320" height="180"></canvas>
        <div class="player-video__noise-box">
            <div class="player-video__noise-icon"><svg><use xlink:href="#sprite-movie"></use></svg></div>
            <div class="player-video__noise-text">${text}</div>
        </div>
    </div>`)

    Video.render().append(noise.html)
    Video.render().toggleClass('player-video--error', true)

    noise.class = new TVNoise(noise.html.find('canvas')[0], {
        width: 320,
        height: 180,
        fps: 25,
        baseBrightness: 14,
        bandBrightness: 30,
        trailAlpha: 0.4
    })

    noise.class.disable('displacement')
    noise.class.disable('jump')
    noise.class.disable('scanlines')
    noise.class.disable('vignette')
    noise.class.disable('flicker')
    noise.class.disable('smear')
}

function destroy(){
    if(noise){
        noise.class.destroy()
        noise.html.remove()
        noise = null
    }

    Video.render().toggleClass('player-video--error', false)
}

export default {
    init,
    destroy
}