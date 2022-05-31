function subscribe(data){
    let inited = false
    let inited_parse  = false

    function getTracks(){
        let video = Lampa.PlayerVideo.video()

        return video.audioTracks || []
    }

    function getSubs(){
        let video = Lampa.PlayerVideo.video()

        return video.textTracks || []
    }

    function setTracks(){
        if(inited_parse){
            let new_tracks   = []
            let video_tracks = getTracks()
            let minus        = 1

            inited_parse.streams.filter(a=>a.codec_type == 'audio').forEach(track=>{
                let elem = {
                    index: track.index - minus,
                    language: track.tags.language,
                    label: track.tags.title,
                    noenter: video_tracks[track.index - minus] ? false : true,
                    ghost: video_tracks[track.index - minus] ? false : true
                }

                Object.defineProperty(elem, "enabled", {
                    set: (v)=>{
                        if(v){
                            let aud = getTracks()
                            let trk = aud[elem.index]

                            for(let i = 0; i < aud.length; i++) aud[i].enabled = false

                            if(trk) trk.enabled = true
                        }
                    },
                    get: ()=>{}
                })

                new_tracks.push(elem)
            })

            Lampa.PlayerPanel.setTracks(new_tracks)
        }
    }

    function setSubs(){
        if(inited_parse){
            let new_subs   = []
            let video_subs = getSubs()
            let minus      = inited_parse.streams.filter(a=>a.codec_type == 'audio').length + 1

            inited_parse.streams.filter(a=>a.codec_type == 'subtitle').forEach(track=>{
                let elem = {
                    index: track.index - minus,
                    language: track.tags.language,
                    label: track.tags.title,
                    noenter: video_subs[track.index - minus] ? false : true,
                    ghost: video_subs[track.index - minus] ? false : true
                }

                Object.defineProperty(elem, "enabled", {
                    set: (v)=>{
                        if(v){
                            let txt = getSubs()
                            let sub = txt[elem.index]

                            for(let i = 0; i < txt.length; i++) txt[i].mode = 'disabled'

                            if(sub) sub.mode = 'showing'
                        }
                    },
                    get: ()=>{}
                })

                new_subs.push(elem)
            })

            Lampa.PlayerPanel.setSubs(new_subs)
        }
    }

    function listenTracks(){
        setTracks()

        Lampa.PlayerVideo.listener.remove('tracks',listenTracks)
    }

    function listenSubs(){
        setSubs()

        Lampa.PlayerVideo.listener.remove('subs',listenSubs)
    }

    function listenStart(){
        inited = true

        let socket = new WebSocket('ws://185.255.132.210:8080/?'+data.torrent_hash+'&index='+data.id)

        socket.addEventListener('message', (event)=> {
            try{
                inited_parse = JSON.parse(event.data)
            }
            catch(e){}

            if(inited){
                setTracks()
                setSubs()
            }

            socket.close()
        })        
    }

    function listenDestroy(){
        inited = false

        Lampa.Player.listener.remove('destroy',listenDestroy)
        Lampa.PlayerVideo.listener.remove('tracks',listenTracks)
        Lampa.PlayerVideo.listener.remove('subs',listenSubs)
        
    }

    Lampa.Player.listener.follow('destroy',listenDestroy)
    Lampa.PlayerVideo.listener.follow('tracks',listenTracks)
    Lampa.PlayerVideo.listener.follow('subs',listenSubs)

    listenStart()
}

Lampa.Player.listener.follow('start', (data)=>{
    if(data.torrent_hash) subscribe(data)
})