import Panel from './panel'

let tm

function luna(params, call, fail){
    if(call) params.onSuccess = call

    params.onFailure = (result)=>{
        console.log('WebOS',params.method + " [fail][" + result.errorCode + "] " + result.errorText )

        if(fail) fail()
    }

    if(false){
        if(params.method == 'getActivePipelines'){
            call([{
                type: 'media',
                id: 'sksjdjendnd',
                is_foreground: true
            }])
        }

        if(params.method == 'subscribe'){
            /*
            call({
                sourceInfo: {
                    programInfo: [
                        {
                            numAudioTracks: 2,
                            numSubtitleTracks: 2,
                            subtitleTrackInfo: [
                                {},
                                {}
                            ],
                            audioTrackInfo: [
                                {},
                                {}
                            ]
                        }
                    ]
                }
            })
            */

            tm = setInterval(()=>{
                call({
                    bufferRange: 100
                })
            },100)
        }

        if(params.method == 'unload'){
            clearInterval(tm)
        }
    }
    else webOS.service.request("luna://com.webos.media", params)
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

    this.start = function(){
        timer = setInterval(this.search.bind(this), 300)
    }

    this.toggleSubtitles = function(status){
        subtitle_visible = status
    
        luna({
            method: 'setSubtitleEnable',
            parameters: { 
                'mediaId': media_id,
                'enable': status
            }
        })
    }

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
                            
                            console.log('WebOS','change subtitles for id:',media_id)

                            luna({
                                method: 'selectTrack',
                                parameters: { 
                                    'type': 'text',
                                    'mediaId': media_id,
                                    'index': sub.index
                                }
                            })
                        }
                    },
                    get: function(){}
                })
    
                all.push(sub)
            }
    
            add({
                title: 'Отключить',
                selected: true
            },-1)
    
            for (let i = 0; i < info.subtitleTrackInfo.length; i++) add(info.subtitleTrackInfo[i], i)
    
            data.subs = all

            Panel.setSubs(data.subs)
        }
    }

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
                            console.log('WebOS','change audio for id:',media_id)

                            luna({
                                method: 'selectTrack',
                                parameters: { 
                                    'type': 'audio',
                                    'mediaId': media_id,
                                    'index': track.index
                                }
                            })
                        }
                    },
                    get: function(){}
                })
    
                all.push(track)
            }
    
            for (let i = 0; i < info.audioTrackInfo.length; i++) add(info.audioTrackInfo[i], i)
    
            data.tracks = all

            Panel.setTracks(data.tracks, true)
        }
    }

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

    this.unsubscribe = function(){
        luna({
            method: 'unload',
            parameters: { 
                'mediaId': media_id
            }
        })
    }

    this.search = function(){
        count++
    
        if(count > 3){
            clearInterval(timer)
            clearInterval(timer_repet)
        }

        const rootSubscribe = ()=>{
            console.log('Webos','Run root','version:',webOS.sdk_version)

            this.toggleSubtitles(false)

            if(this.subscribed) clearInterval(timer_repet)

            if(!this.subscribed) this.subscribe()
            else{
                if(data.tracks.length) Panel.setTracks(data.tracks,true)
                if(data.subs.length)   Panel.setSubs(data.subs)
            }

            clearInterval(timer)
        }

        const videoSubscribe = ()=>{
            console.log('Webos','Run video','version:',webOS.sdk_version)

            this.callback = false

            this.unsubscribe = ()=>{}

            this.toggleSubtitles(false)

            if(this.subscribed) clearInterval(timer_repet)

            if(!this.subscribed) this.subscribe()
            
            clearInterval(timer)
        }

        console.log('Webos','try get id:', video.mediaId)

        if(video.mediaId){
            media_id = video.mediaId

            console.log('Webos','video id:',media_id)

            if(webOS.sdk_version){
                if(webOS.sdk_version > 3 && webOS.sdk_version < 4){
                    rootSubscribe()
                }
                else videoSubscribe()
            }
            else rootSubscribe()
        }

        /*
        luna({
            method: 'getActivePipelines'
        },(result)=>{
    
            console.log('WebOS', 'getActivePipelines', result)
    
            result.forEach(element => {
                if(element.type == 'media' && element.id && element.is_foreground) media_id = element.id
            })
    
            console.log('WebOS', 'video id:', media_id)
            
            if(media_id) rootSubscribe()
            
        },()=>{
            if(video.mediaId) videoSubscribe()
        })
        */
    }

    this.call = function(){
        if(this.callback) this.callback()

        this.callback = false
    }

    this.repet = function(new_video){
        video = new_video

        console.log('Webos','repeat to new video', new_video ? true : false)

        media_id = ''

        clearInterval(timer)

        count = 0

        this.repeted = true
    
        timer_repet = setInterval(this.search.bind(this), 300)
    }

    this.rewinded = function(){
        this.toggleSubtitles(subtitle_visible)
    }

    this.destroy = function(){
        clearInterval(timer)
        clearInterval(timer_repet)
    
        if(media_id) this.unsubscribe()
    
        data = null
    
        this.subscribed = false
        this.callback   = false
    }
}

/*
let subs = [],
    adsu = (i)=>{
        let sub = {
            index: i,
            title: i == -1 ? 'Отключить' : '',
            selected: i == -1
        }

        Object.defineProperty(sub, "mode", { 
            set: function (v) { 
                if(v == 'showing'){
                    webosSubtitlesToggle(sub.index == -1 ? false : true)

                    console.log('Player', 'toggle index:', sub.index)

                    webOS.service.request("luna://com.webos.media", {
                        method:"selectTrack",
                        parameters: {
                            "type": "text",
                            "mediaId": media_id,
                            "index": sub.index
                        },
                        onSuccess: function (result) {
                            
                        },
                        onFailure: function (result) {
                            console.log('Player',"toggle track [fail][" + result.errorCode + "] " + result.errorText )
                        }
                    })
                }
            },
            get: function(){}
        });

        subs.push(sub)
    }

for (let i = -1; i <= 10; i++) adsu(i)

listener.send('subs', {subs: subs})
*/

export default create