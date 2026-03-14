import Subscribe from '../../utils/subscribe'
import Lang from '../../core/lang'
import Panel from './panel'
import Manifest from '../../core/manifest'

function YouTube(call_video){
    let stream_url
    let loaded = false

    let needclick = true // Platform.screen('mobile') || navigator.userAgent.toLowerCase().indexOf('android') >= 0

    let object = $(`
        <div class="player-video__youtube">
            <div class="player-video__youtube-player"></div>
            <div class="player-video__youtube-line-top"></div>
            <div class="player-video__youtube-line-bottom"></div>
            <div class="player-video__youtube-noplayed hide">
                <svg class="player-video__youtube-icon"><use xlink:href="#sprite-youtube"></use></svg>
                <div>${Lang.translate('player_youtube_no_played')}</div>
            </div>
        </div>
    `)

    let video = object[0]
    let listener = Subscribe()
    let volume = 100
    let timeupdate
    let timetapplay
	let timer_waite

    let frame = null
    let frameWindow = null
    let frameReady = false

    const bridgeId = 'yt_' + Math.random().toString(36).slice(2)

    function getYouTubeId(url){
        if(!url) return ''

        try{
            url = String(url).trim()

            if(url.includes('youtu.be/')){
                return url.split('youtu.be/')[1].split(/[?&#/]/)[0]
            }

            if(url.includes('youtube.com/embed/')){
                return url.split('youtube.com/embed/')[1].split(/[?&#/]/)[0]
            }

            if(url.includes('v=')){
                return url.split('v=')[1].split('&')[0]
            }

            return url
        }
        catch(e){
            return ''
        }
    }

    function postToFrame(type, data = {}){
        try{
            if(frameWindow){
                frameWindow.postMessage({
                    bridgeId,
                    type,
                    data
                }, '*')
            }
        }
        catch(e){}
    }

    function videoSize(){
        let size = {
            width: 0,
            height: 0
        }

        let str = video._playbackQuality || ''

        if(str === 'highres' || str === 'hd2160'){
            size.width = 3840
            size.height = 2160
        }
        else if(str === 'hd1440'){
            size.width = 2560
            size.height = 1440
        }
        else if(str === 'hd1080'){
            size.width = 1920
            size.height = 1080
        }
        else if(str === 'hd720'){
            size.width = 1280
            size.height = 720
        }
        else{
            size.width = 854
            size.height = 480
        }

        return size
    }

    function onMessage(event){
        if(!event.data || event.data.bridgeId !== bridgeId) return

        const { type, data } = event.data

        if(type === 'bridgeReady'){
            frameReady = true
            return
        }

        if(type === 'ready'){
            loaded = true

            listener.send('canplay')
            listener.send('loadeddata')

            clearInterval(timeupdate)
            timeupdate = setInterval(() => {
                if(video._playerState !== 2) listener.send('timeupdate')
            }, 100)

            if(needclick) listener.send('playing')
            return
        }

        if(type === 'stateChange'){
            const state = data ? data.state : -1

            video._playerState = state

            object.removeClass('ended')

            if(needclick){
                object.find('.player-video__youtube-needclick div').text(Lang.translate('loading') + '...')
            }

            if(state === 1){
                listener.send('playing')

                clearTimeout(timetapplay)

                if(needclick){
                    needclick = false

                    setTimeout(() => {
                        object.find('.player-video__youtube-needclick').remove()
                    }, 500)
                }
            }

            if(state === 0){
                object.addClass('ended')
                listener.send('ended')
            }

            if(state === 3){
                listener.send('waiting')
            }

            return
        }

        if(type === 'time'){
            video._currentTime = data.currentTime || 0
            video._duration = data.duration || 0
            video._playerState = typeof data.playerState === 'number' ? data.playerState : video._playerState
            video._playbackQuality = data.playbackQuality || ''
            return
        }

        if(type === 'qualityChange'){
            video._playbackQuality = data.quality || ''
            console.log('YouTube', 'quality', video._playbackQuality)
            return
        }

        if(type === 'error'){
            console.log('YouTube', 'error', data ? data.error : '')

            object.find('.player-video__youtube-noplayed').removeClass('hide')
            object.addClass('ended')

            if(needclick) object.find('.player-video__youtube-needclick').remove()

            clearTimeout(timetapplay)
        }
    }

    function createFrame(videoId){
        if(frame) return

		let url = Manifest.github_lampa + 'youtube.html?bridgeId=' + bridgeId + '&videoId=' + videoId + '&autoplay=1&controls=1&mute=0&start=0'

        frame = document.createElement('iframe')
        frame.className = 'player-video__youtube-bridge-frame'
        frame.src = url.toString()
        frame.setAttribute('frameborder', '0')
        frame.setAttribute('allowfullscreen', 'true')
        frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture')
        frame.style.border = '0'
        frame.style.display = 'block'

        frame.onload = () => {
            try{
                frameWindow = frame.contentWindow
            }
            catch(e){}
        }

        object.find('.player-video__youtube-player').empty().append(frame)
    }

    Object.defineProperty(video, 'src', {
        set: function(url){
            if(url) stream_url = url
        },
        get: function(){}
    })

    Object.defineProperty(video, 'currentTime', {
        set: function(t){
            video._currentTime = t
            postToFrame('seekTo', { time: t })
        },
        get: function(){
            return video._currentTime || 0
        }
    })

    Object.defineProperty(video, 'duration', {
        set: function(){},
        get: function(){
            return video._duration || 0
        }
    })

    Object.defineProperty(video, 'paused', {
        set: function(){},
        get: function(){
            if(needclick) return true
            return video._playerState === 2 || video._playerState == null
        }
    })

    Object.defineProperty(video, 'audioTracks', {
        set: function(){},
        get: function(){
            return []
        }
    })

    Object.defineProperty(video, 'textTracks', {
        set: function(){},
        get: function(){
            return []
        }
    })

    Object.defineProperty(video, 'videoWidth', {
        set: function(){},
        get: function(){
            return videoSize().width
        }
    })

    Object.defineProperty(video, 'videoHeight', {
        set: function(){},
        get: function(){
            return videoSize().height
        }
    })

    Object.defineProperty(video, 'volume', {
        set: function(num){
            volume = num * 100
            postToFrame('setVolume', { volume })
        },
        get: function(){}
    })

    video.canPlayType = function(){
        return true
    }

    video.resize = function(){
        postToFrame('resize')
    }

    video.addEventListener = listener.follow.bind(listener)

    video.load = function(){
        if(stream_url && !frame){
            const id = getYouTubeId(stream_url)

            if(!id){
                object.find('.player-video__youtube-noplayed')
                    .removeClass('hide')
                    .find('div')
                    .text(Lang.translate('player_youtube_no_support'))
                return
            }

            video._currentTime = 0
            video._duration = 0
            video._playerState = -1
            video._playbackQuality = ''

            video.resize()
            createFrame(id)

            if(needclick){
                object.append(`
                    <div class="player-video__youtube-needclick">
                        <img src="https://img.youtube.com/vi/${id}/sddefault.jpg" />
                        <div>${Lang.translate('loading')}...</div>
                    </div>
                `)

                timetapplay = setTimeout(() => {
                    object.find('.player-video__youtube-needclick div').text(Lang.translate('player_youtube_start_play'))
                    Panel.update('pause')
                }, 10000)
            }

            const waitFrame = () => {
                if(!frameReady){
                    timer_waite = setTimeout(waitFrame, 50)
                    return
                }

                postToFrame('init', { volume })
            }

            waitFrame()
        }
    }

    video.play = function(){
        postToFrame('play')
    }

    video.pause = function(){
        postToFrame('pause')
    }

    video.size = function(type){}

    video.speed = function(speed){
        postToFrame('setPlaybackRate', { rate: speed })
    }

    video.destroy = function(){
        clearInterval(timeupdate)
        clearTimeout(timetapplay)
		clearTimeout(timer_waite)

        postToFrame('destroy')

        if(frame){
            try{
                frame.remove()
            }
            catch(e){}
        }

        frame = null
        frameWindow = null
        frameReady = false
        loaded = false

        window.removeEventListener('message', onMessage)

        object.remove()
        listener.destroy()
    }

    window.addEventListener('message', onMessage)

    call_video(video)

    return object
}

export default YouTube
