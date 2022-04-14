function player(){
    let html   = Lampa.Template.get('radio_player',{})
    let audio  = new Audio()
    let url    = ''
    let played = false
    let hls

    audio.addEventListener("play", event => {
        played = true

        html.toggleClass('loading',false)
    })

    function prepare(){
        if(audio.canPlayType('application/vnd.apple.mpegurl') || url.indexOf('.aacp') > 0) load()
        else if (Hls.isSupported()) {
            try{
                hls = new Hls()
                hls.attachMedia(audio)
                hls.loadSource(url)
                hls.on(Hls.Events.ERROR, function (event, data){
                    if(data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR){
                        if(data.reason === "no EXTM3U delimiter") {
                            Lampa.Noty.show('Ошибка в загрузке потока')
                        }
                    }
                })
                hls.on(Hls.Events.MANIFEST_LOADED, function(){
                    start()
                })
            }
            catch(e){
                Lampa.Noty.show('Ошибка в загрузке потока')
            }
        }
        else load()
    }

    function load(){
        audio.src = url

        audio.load()

        start()
    }

    function start(){
        var playPromise;
    
        try{
            playPromise = audio.play()
        }
        catch(e){ }
    
    
        if (playPromise !== undefined) {
            playPromise.then(function(){
                console.log('Radio','start plaining')
            })
            .catch(function(e){
                console.log('Radio','play promise error:', e.message)
            });
        }
    }

    function play(){
        html.toggleClass('loading',true)
        html.toggleClass('stop',false)

        prepare()
    }

    function stop(){
        played = false

        html.toggleClass('stop',true)
        html.toggleClass('loading',false)

        if(hls){
            hls.destroy()
            hls = false
        }

        audio.src = ''
    }

    html.on('hover:enter',()=>{
        if(played) stop()
        else if(url) play()
    })

    this.create = function(){
        $('.head__actions .open--search').before(html)
    }

    this.play = function(data){
        stop()

        url = data.stream_320 ? data.stream_320 : data.stream_128 ? data.stream_128 : data.stream_hls.replace('playlist.m3u8','96/playlist.m3u8')

        html.find('.radio-player__name').text(data.title)

        html.toggleClass('hide',false)

        play()
    }
}

export default player