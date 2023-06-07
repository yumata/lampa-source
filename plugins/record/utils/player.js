function Player(station){
    let html   = Lampa.Template.js('radio_player')
    let audio  = new Audio()
    let url    = station.stream_320 ? station.stream_320 : station.stream_128 ? station.stream_128 : station.stream ? station.stream : station.stream_hls ? station.stream_hls.replace('playlist.m3u8','96/playlist.m3u8') : ''
    let hls

    audio.addEventListener("playing", event => {
        changeWave('play')
    })

    audio.addEventListener("waiting", event => {
        changeWave('loading')
    })

    let screenreset = setInterval(()=>{
        Lampa.Screensaver.resetTimer()
    }, 1000)

    function prepare(){
        if(audio.canPlayType('application/vnd.apple.mpegurl') || url.indexOf('.aacp') > 0 || station.stream) load()
        else if (Hls.isSupported()) {
            try{
                hls = new Hls()
                hls.attachMedia(audio)
                hls.loadSource(url)
                hls.on(Hls.Events.ERROR, function (event, data){
                    if(data.details === Hls.ErrorDetails.MANIFEST_PARSING_ERROR){
                        if(data.reason === "no EXTM3U delimiter") {
                            Lampa.Noty.show(Lampa.Lang.translate('radio_load_error'))
                        }
                    }
                })
                hls.on(Hls.Events.MANIFEST_LOADED, function(){
                    start()
                })
            }
            catch(e){
                Lampa.Noty.show(Lampa.Lang.translate('radio_load_error'))
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

                changeWave('play')
            })
            .catch(function(e){
                console.log('Radio','play promise error:', e.message)
            });
        }
    }

    function stop(){
        if(hls){
            hls.destroy()
            hls = false
        }

        audio.src = ''
    }

    function createWave(){
        let box = html.find('.radio-player__wave')

        for(let i = 0; i < 15; i++){
            let div = document.createElement('div')

            box.append(div)
        }

        changeWave('loading')
    }

    function changeWave(class_name){
        let lines = html.find('.radio-player__wave').querySelectorAll('div')

        for(let i = 0; i < lines.length; i++){
            lines[i].removeClass('play loading').addClass(class_name)

            lines[i].style['animation-duration'] = (class_name == 'loading' ? 400 : 200 + Math.random() * 200) + 'ms'
            lines[i].style['animation-delay']    = (class_name == 'loading' ? Math.round(400 / lines.length * i) : 0) + 'ms'
        }
    }

    this.create = function(){
        let cover = Lampa.Template.js('radio_cover')

        cover.find('.radio-cover__title').text(station.title || '')
        cover.find('.radio-cover__tooltip').text(station.tooltip || '')

        let img_box = cover.find('.radio-cover__img-box')
        let img_elm = img_box.find('img')

        img_box.removeClass('loaded loaded-icon')

        img_elm.onload = ()=>{
            img_box.addClass('loaded')
        }

        img_elm.onerror = ()=>{
            img_elm.src = './img/icons/menu/movie.svg'

            img_box.addClass('loaded-icon')
        }

        img_elm.src = station.bg_image_mobile

        html.find('.radio-player__cover').append(cover)

        html.find('.radio-player__close').on('click',()=>{
            window.history.back()
        })

        document.body.append(html)

        createWave()

        prepare()
    }

    this.destroy = function(){
        stop()

        clearInterval(screenreset)

        html.remove()
    }
}

export default Player