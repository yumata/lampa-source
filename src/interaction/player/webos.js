import Panel from './panel'
import WebosSubs from './webos_subp'
import Video from './video'
import Lang from '../../core/lang'

/**
 * Для запросов в луну
 * @param {object} params 
 * @param {function} call 
 * @param {function} fail 
 */
function luna(params, call, fail){
    if(call) params.onSuccess = call

    params.onFailure = (result)=>{
        console.log('WebOS',params.method + " [fail][" + result.errorCode + "] " + result.errorText )

        if(fail) fail()
    }

    webOS.service.request("luna://com.webos.media", params)
}

function create(_video){
    let video = _video
    let media_id
    let subtitle_visible = false
    let timer
    let timer_repet
    let count = 0
    let count_message = 0
    let data = {
        subs: [],
        tracks: []
    }

    this.subscribed = false
    this.repeted = false

    /**
     * Начинаем поиск видео
     */
    this.start = function(){
        timer = setInterval(this.search.bind(this), 300)
    }

    /**
     * Включить/выключить сабы
     * @param {boolean} status 
     */
    this.toggleSubtitles = function(status){
        subtitle_visible = status
    
        luna({
            method: 'setSubtitleEnable',
            parameters: { 
                'mediaId': media_id,
                'enable': status
            }
        })

        if(status) WebosSubs.initialize()
    }

    /**
     * Получили сабы, выводим в панель
     * @param {object} info 
     */
    this.subtitles = function(info){
        if(info.numSubtitleTracks){
            let all = []
            let add = (sub, index)=>{
                sub.index    = index
                sub.language = sub.language == '(null)' ? '' : sub.language 
    
                Object.defineProperty(sub, 'mode', { 
                    set: (v)=>{
                        if(v == 'showing'){
                            this.toggleSubtitles(sub.index == -1 ? false : true)
                            
                            console.log('WebOS','change subtitles for id: ',media_id, ' index:',sub.index)

                            if(sub.index !== -1){
                                setTimeout(()=>{
                                    luna({
                                        method: 'selectTrack',
                                        parameters: { 
                                            'type': 'text',
                                            'mediaId': media_id,
                                            'index': sub.index
                                        }
                                    })
                                },500)
                            }
                        }
                    },
                    get: function(){}
                })
    
                all.push(sub)
            }
    
            add({
                title: Lang.translate('player_disabled'),
                selected: true
            },-1)
    
            for (let i = 0; i < info.subtitleTrackInfo.length; i++) add(info.subtitleTrackInfo[i], i)
    
            data.subs = all

            Video.listener.send('webos_subs',{subs:data.subs})

            Panel.setSubs(data.subs)
        }
    }

    /**
     * Получили дорожки, выводим в панель
     * @param {object} info 
     */
    this.tracks = function (info){
        if(info.numAudioTracks){
            let all = []
            let add = (track, index)=>{
                track.index = index
                track.selected = index == -1
                track.extra = {
                    channels: track.channels,
                    fourCC: track.codec
                }
    
                Object.defineProperty(track, 'enabled', { 
                    set: function (v) { 
                        if(v){
                            console.log('WebOS','change audio for id:',media_id, ' index:',track.index)

                            luna({
                                method: 'selectTrack',
                                parameters: { 
                                    'type': 'audio',
                                    'mediaId': media_id,
                                    'index': track.index
                                }
                            })

                            if(video.audioTracks){
                                for(let i = 0; i < video.audioTracks.length; i++){
                                    video.audioTracks[i].enabled = false
                                }

                                if(video.audioTracks[track.index]){
                                    video.audioTracks[track.index].enabled = true

                                    console.log('WebOS','change audio two method:', track.index)
                                }
                            } 
                        }
                    },
                    get: function(){}
                })
    
                all.push(track)
            }
    
            for (let i = 0; i < info.audioTrackInfo.length; i++) add(info.audioTrackInfo[i], i)
    
            data.tracks = all

            Video.listener.send('webos_tracks',{tracks:data.tracks})

            Panel.setTracks(data.tracks, true)
        }
    }

    /**
     * Подписываемся на видео и ждем события
     */
    this.subscribe = function (){
        this.subscribed = true

        luna({
            method: 'subscribe',
            parameters: { 
                'mediaId': media_id,
                'subscribe': true
            }
        },(result)=>{
            if(result.sourceInfo && !this.sourceInfo){
                this.sourceInfo = true

                let info = result.sourceInfo.programInfo[0]
    
                this.subtitles(info)
    
                this.tracks(info)
    
                this.unsubscribe()

                this.call()
            }

            if(result.bufferRange){
                count_message++

                if(count_message == 30){
                    this.unsubscribe()

                    this.call()
                }
            }
            else{
                //console.log('WebOS', 'subscribe', result)
            }
        },()=>{
            this.call()
        })
    }

    /**
     * Отписка от видео
     */
    this.unsubscribe = function(){
        luna({
            method: 'unload',
            parameters: { 
                'mediaId': media_id
            }
        })
    }

    /**
     * Сканируем наличия видео
     */
    this.search = function(){
        count++
    
        if(count > 3){
            clearInterval(timer)
            clearInterval(timer_repet)
        }

        const rootSubscribe = ()=>{
            console.log('WebOS','Run root','version:',webOS.sdk_version)

            this.toggleSubtitles(false)

            if(this.subscribed) clearInterval(timer_repet)

            if(!this.subscribed) this.subscribe()
            else{
                if(data.tracks.length){
                    Video.listener.send('webos_tracks',{tracks:data.tracks})

                    Panel.setTracks(data.tracks,true)
                } 
                if(data.subs.length){
                    Video.listener.send('webos_subs',{subs:data.subs})

                    Panel.setSubs(data.subs)
                }
            }

            clearInterval(timer)
        }

        console.log('WebOS','try get id:', video.mediaId)

        if(video.mediaId){
            media_id = video.mediaId

            console.log('WebOS','video id:',media_id)

            rootSubscribe()
        }
    }

    /**
     * Вызываем и завершаем работу
     */
    this.call = function(){
        if(this.callback) this.callback()

        this.callback = false
    }

    this.speed = function (v){
        luna({
            method: 'setPlayRate',
            parameters: { 
                'mediaId': media_id,
                'playRate': v,
                'audioOutput': true
            }
        })
    }

    /**
     * Создаем новое видео
     * @param {object} new_video 
     */
    this.repet = function(new_video){
        video = new_video

        console.log('WebOS','repeat to new video', new_video ? true : false)

        media_id = ''

        clearInterval(timer)

        count = 0

        this.repeted = true
    
        timer_repet = setInterval(this.search.bind(this), 300)
    }

    /**
     * После перемотки включаем состояние сабов
     */
    this.rewinded = function(){
        this.toggleSubtitles(subtitle_visible)
    }

    /**
     * Уничтожить
     */
    this.destroy = function(){
        clearInterval(timer)
        clearInterval(timer_repet)
    
        if(media_id) this.unsubscribe()
    
        data = null
    
        this.subscribed = false
        this.callback   = false
    }
}

export default create