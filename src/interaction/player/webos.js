import Panel from './panel'

let media_id
let subtitle_visible = false

function luna(params, call){
    if(call) params.onSuccess = call

    params.onFailure = (result)=>{
        console.log('WebOS',params.method + " [fail][" + result.errorCode + "] " + result.errorText )
    }

    webOS.service.request("luna://com.webos.media", params)
}

function subtitles(){
    if(info.numSubtitleTracks){
        let all = []
        let add = (sub, index)=>{
            sub.index = index

            Object.defineProperty(sub, 'mode', { 
                set: function (v) { 
                    if(v == 'showing'){
                        toggleSubtitles(sub.index == -1 ? false : true)

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
            index: -1,
            title: 'Отключить',
            selected: true
        })

        for (let i = 0; i < info.subtitleTrackInfo.length; i++) add(info.subtitleTrackInfo[i], i)

        Panel.setSubs(all)
    }
}

function tracks(info){
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
                        luna({
                            method: 'selectTrack',
                            parameters: { 
                                'type': 'audio',
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

        for (let i = 0; i < info.audioTrackInfo.length; i++) add(info.audioTrackInfo[i], i)

        Panel.setTracks(all)
    }
}

function subscribe(){
    luna({
        method: 'subscribe',
        parameters: { 
            'mediaId': media_id,
            'subscribe': true
        }
    },(result)=>{
        if(result.sourceInfo){
            let info = result.sourceInfo.programInfo[0]

            subtitles(info)
            tracks(info)
        }
    })
}

function unsubscribe(){
    luna({
        method: 'subscribe',
        parameters: { 
            'mediaId': media_id,
            'subscribe': false
        }
    })
}

function toggleSubtitles(status){
    subtitle_visible = status

    luna({
        method: 'setSubtitleEnable',
        parameters: { 
            'mediaId': media_id,
            'enable': status
        }
    })
}

function rewinded(){
    toggleSubtitles(subtitle_visible)
}

function destroy(){
    if(media_id) unsubscribe()

    media_id = ''
}


function create(){
    luna({
        method: 'getActivePipelines'
    },(result)=>{

        result.forEach(element => {
            if(element.type == 'media' && element.id && element.is_foreground) media_id = element.id
        })

        console.log('WebOS', 'video id:', media_id)

        if(media_id){
            toggleSubtitles(false)

            subscribe()
        }
        
    })

    this.rewinded = rewinded

    this.destroy = destroy
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