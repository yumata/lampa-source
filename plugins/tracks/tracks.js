function subscribe(data){
    let inited        = false
    let inited_parse  = false
    let webos_replace = {}
    let logs          = true

    function log(){
        if(logs) console.log.apply(console.log, arguments)
    }

    function getTracks(){
        let video = Lampa.PlayerVideo.video()

        return video.audioTracks || []
    }

    function getSubs(){
        let video = Lampa.PlayerVideo.video()

        return video.textTracks || []
    }

    log('Tracks', 'start')

    function setTracks(){
        if(inited_parse){
            let new_tracks   = []
            let video_tracks = getTracks()
            let parse_tracks = inited_parse.streams.filter(a=>a.codec_type == 'audio')
            let minus        = 1

            log('Tracks', 'set tracks:', video_tracks.length)

            if(parse_tracks.length !== video_tracks.length) parse_tracks = parse_tracks.filter(a=>a.codec_name !== 'dts')

            parse_tracks = parse_tracks.filter(a=>a.tags)

            log('Tracks', 'filtred tracks:', parse_tracks.length)

            parse_tracks.forEach(track=>{
                let orig = video_tracks[track.index - minus]
                let elem = {
                    index: track.index - minus,
                    language: track.tags.language,
                    label: track.tags.title || track.tags.handler_name,
                    ghost: orig ? false : true,
                    selected: orig ? orig.selected == true || orig.enabled == true : false
                }

                console.log('Tracks','tracks original', orig)

                Object.defineProperty(elem, "enabled", {
                    set: (v)=>{
                        if(v){
                            let aud = getTracks()
                            let trk = aud[elem.index]

                            for(let i = 0; i < aud.length; i++){
                                aud[i].enabled  = false
                                aud[i].selected = false
                            } 

                            if(trk){
                                trk.enabled  = true
                                trk.selected = true
                            } 
                        }
                    },
                    get: ()=>{}
                })

                new_tracks.push(elem)
            })

            if(parse_tracks.length) Lampa.PlayerPanel.setTracks(new_tracks)
        }
    }

    function setSubs(){
        if(inited_parse){
            let new_subs   = []
            let video_subs = getSubs()
            let parse_subs = inited_parse.streams.filter(a=>a.codec_type == 'subtitle')
            let minus      = inited_parse.streams.filter(a=>a.codec_type == 'audio').length + 1

            log('Tracks', 'set subs:', video_subs.length)

            parse_subs = parse_subs.filter(a=>a.tags)

            log('Tracks', 'filtred subs:', parse_subs.length)

            parse_subs.forEach(track=>{
                let orig = video_subs[track.index - minus]
                let elem = {
                    index: track.index - minus,
                    language: track.tags.language,
                    label: track.tags.title || track.tags.handler_name,
                    ghost: video_subs[track.index - minus] ? false : true,
                    selected: orig ? orig.selected == true || orig.mode == 'showing' : false
                }

                console.log('Tracks','subs original', orig)

                Object.defineProperty(elem, "mode", {
                    set: (v)=>{
                        if(v){
                            let txt = getSubs()
                            let sub = txt[elem.index]

                            for(let i = 0; i < txt.length; i++){
                                txt[i].mode = 'disabled'
                                txt[i].selected = false
                            }

                            if(sub){
                                sub.mode = 'showing'
                                sub.selected = true
                            } 
                        }
                    },
                    get: ()=>{}
                })

                new_subs.push(elem)
            })

            if(parse_subs.length) Lampa.PlayerPanel.setSubs(new_subs)
        }
    }

    function listenTracks(){
        log('Tracks', 'tracks video event')

        setTracks()

        Lampa.PlayerVideo.listener.remove('tracks',listenTracks)
    }

    function listenSubs(){
        log('Tracks', 'subs video event')

        setSubs()

        Lampa.PlayerVideo.listener.remove('subs',listenSubs)
    }

    function canPlay(){
        log('Tracks', 'canplay video event')

        if(webos_replace.tracks)  setWebosTracks(webos_replace.tracks)
        else setTracks()

        if(webos_replace.subs)   setWebosSubs(webos_replace.subs)
        else setSubs()

        Lampa.PlayerVideo.listener.remove('canplay',canPlay)
    }

    function setWebosTracks(video_tracks){
        if(inited_parse){
            let parse_tracks = inited_parse.streams.filter(a=>a.codec_type == 'audio')

            log('Tracks', 'webos set tracks:', video_tracks.length)
            
            if(parse_tracks.length !== video_tracks.length){
                if(webOS.sdk_version < 5 ) parse_tracks = parse_tracks.filter(a=>a.codec_name !== 'truehd')
                else parse_tracks = parse_tracks.filter(a=>a.codec_name !== 'dts' && a.codec_name !== 'truehd')
            }

            parse_tracks = parse_tracks.filter(a=>a.tags)

            log('Tracks','webos tracks', video_tracks)

            parse_tracks.forEach((track,i)=>{
                if(video_tracks[i]){
                    video_tracks[i].language = track.tags.language
                    video_tracks[i].label    = track.tags.title || track.tags.handler_name
                }
            })
        }
    }

    function setWebosSubs(video_subs){
        if(inited_parse){
            let parse_subs = inited_parse.streams.filter(a=>a.codec_type == 'subtitle')

            log('Tracks', 'webos set subs:', video_subs.length)

            if(parse_subs.length !== video_subs.length-1) parse_subs = parse_subs.filter(a=>a.codec_name !== 'hdmv_pgs_subtitle')            
            
            parse_subs = parse_subs.filter(a=>a.tags)

            parse_subs.forEach((track,a)=>{
                let i = a + 1

                if(video_subs[i]){
                    video_subs[i].language = track.tags.language
                    video_subs[i].label = track.tags.title || track.tags.handler_name
                }
            })
        }
    }

    function listenWebosSubs(_data){
        log('Tracks','webos subs event')

        webos_replace.subs = _data.subs

        if(inited_parse) setWebosSubs(_data.subs)
    }

    function listenWebosTracks(_data){
        log('Tracks','webos tracks event')

        webos_replace.tracks = _data.tracks

        if(inited_parse) setWebosTracks(_data.tracks)
    }

    function listenStart(){
        inited = true

        let socket = new WebSocket('ws://185.204.0.61:8080/?'+data.torrent_hash+'&index='+data.id)

        socket.addEventListener('message', (event)=> {
            try{
                inited_parse = JSON.parse(event.data)
            }
            catch(e){}

            log('Tracks', 'parsed', inited_parse)

            if(inited){
                if(webos_replace.subs)   setWebosSubs(webos_replace.subs)
                else setSubs()

                if(webos_replace.tracks) setWebosTracks(webos_replace.tracks)
                else setTracks()
            }

            socket.close()
        })        
    }

    function listenDestroy(){
        inited = false

        Lampa.Player.listener.remove('destroy',listenDestroy)
        Lampa.PlayerVideo.listener.remove('tracks',listenTracks)
        Lampa.PlayerVideo.listener.remove('subs',listenSubs)
        Lampa.PlayerVideo.listener.remove('webos_subs',listenWebosSubs)
        Lampa.PlayerVideo.listener.remove('webos_tracks',listenWebosTracks)
        Lampa.PlayerVideo.listener.remove('canplay',canPlay)
        
        log('Tracks', 'end')
    }

    Lampa.Player.listener.follow('destroy',listenDestroy)
    Lampa.PlayerVideo.listener.follow('tracks',listenTracks)
    Lampa.PlayerVideo.listener.follow('subs',listenSubs)
    Lampa.PlayerVideo.listener.follow('webos_subs',listenWebosSubs)
    Lampa.PlayerVideo.listener.follow('webos_tracks',listenWebosTracks)
    Lampa.PlayerVideo.listener.follow('canplay',canPlay)

    listenStart()
}

Lampa.Player.listener.follow('start', (data)=>{
    if(data.torrent_hash) subscribe(data)
})
