import Subscribe from '../../utils/subscribe'

function YouTube(call_video){
    let stream_url, loaded

    let object   = $('<div class="player-video__youtube"><div class="player-video__youtube-player" id="youtube-player"></div><div class="player-video__youtube-line-top"></div><div class="player-video__youtube-line-bottom"></div></div>')
	let video    = object[0]
    let listener = Subscribe()
    let youtube
    let timeupdate

    function videoSize(){
        let size = {
            width: 854,
            height: 480
        }

        if(youtube){
            let str = '' 
            
            try{
                str = youtube.getPlaybackQuality()
            }
            catch(e){}
            
            if(str == 'highres'){
                size.width = 3840
                size.height = 2160
            }

            if(str == 'hd1080'){
                size.width = 1920
                size.height = 1080
            }

            if(str == 'hd720'){
                size.width = 1280
                size.height = 720
            }
        }

        return size
    }

	/**
	 * Установить урл
	 */
	Object.defineProperty(video, "src", { 
		set: function (url) {
			if(url){
                stream_url = url
			}
		},
		get: function(){}
	});

	/**
	 * Позиция
	 */
	Object.defineProperty(video, "currentTime", { 
		set: function (t) { 
            try{
                youtube.seekTo(t)
            }
			catch(e){}
		},
		get: function(){
            try{
                return youtube.getCurrentTime()
            }
            catch(e){
                return 0
            }
		}
	});

	/**
	 * Длительность
	 */
	Object.defineProperty(video, "duration", { 
		set: function () { 
			
		},
		get: function(){
            try{
                return youtube.getDuration()
            }
            catch(e){
                return 0
            }
		}
	});

	/**
	 * Пауза
	 */
	Object.defineProperty(video, "paused", { 
		set: function () { 
			
		},
		get: function(){
            try{
                return youtube.getPlayerState() == YT.PlayerState.PAUSED
            }
			catch(e){
                return true
            }
		}
	});

	/**
	 * Аудиодорожки
	 */
	Object.defineProperty(video, "audioTracks", { 
		set: function () { 
			
		},
		get: function(){
			return []
		}
	});

	/**
	 * Субтитры
	 */
	Object.defineProperty(video, "textTracks", { 
		set: function () { 
			
		},
		get: function(){
			return []
		}
	});

	/**
	 * Ширина видео
	 */
	Object.defineProperty(video, "videoWidth", { 
		set: function () { 
			
		},
		get: function(){
			return videoSize().width
		}
	});

	/**
	 * Высота видео
	 */
	Object.defineProperty(video, "videoHeight", { 
		set: function () { 
			
		},
		get: function(){
			return videoSize().height
		}
	});


	/**
	 * Всегда говорим да, мы можем играть
	 */
	video.canPlayType = function(){
		return true
	}

    video.resize = function(){
        object.find('.player-video__youtube-player').width(window.innerWidth)
	    object.find('.player-video__youtube-player').height(window.innerHeight + 600)
    }

    /**
	 * Вешаем кастомные события
	 */
	video.addEventListener = listener.follow.bind(listener)

	/**
	 * Загрузить
	 */
	video.load = function(){
		if(stream_url && !youtube){
            video.resize()

			youtube = new YT.Player('youtube-player', {
                height: window.innerHeight,
                width: window.innerWidth,
                playerVars: { 
                    'controls': 0,
                    'showinfo': 0,
                    'autohide': 1,
                    'modestbranding': 1,
                    'autoplay': 1,
                    'disablekb': 1,
                    'fs': 0,
                    'enablejsapi': 1,
                    'playsinline': 1,
                    'rel': 0,
                    'suggestedQuality': 'hd1080',
                    'setPlaybackQuality': 'hd1080'
                },
                videoId: stream_url.split('?v=').pop(),
                events: {
                    onReady: (event)=>{
                        loaded = true

                        event.target.setPlaybackQuality('hd1080')

                        listener.send('canplay')

                        listener.send('loadeddata')

                        timeupdate = setInterval(()=>{
                            if(youtube.getPlayerState() !== YT.PlayerState.PAUSED) listener.send('timeupdate')
                        },100)
                    },
                    onStateChange: (state)=>{
                        object.removeClass('ended')

                        if(state.data == YT.PlayerState.PLAYING){
                            listener.send('playing')
                        }

                        if(state.data == YT.PlayerState.ENDED){
                            object.addClass('ended')

                            listener.send('ended')
                        }
        
                        if (state.data == YT.PlayerState.BUFFERING) {
                            listener.send('waiting')
                        }
                    },
                    onPlaybackQualityChange: (state)=>{
                        console.log('YouTube','quality',state.target.getPlaybackQuality())
                    }
                }
            })
		}
	}

	/**
	 * Играть
	 */
	video.play = function(){
        try{
            youtube.playVideo()
        }
		catch(e){}
	}

	/**
	 * Пауза
	 */
	video.pause = function(){
        try{
            youtube.pauseVideo()
        }
		catch(e){}
	}

	/**
	 * Установить масштаб
	 */
	video.size = function(type){}

	/**
	 * Установить скорость
	 */
	video.speed = function(speed){}

	/**
	 * Уничтожить
	 */
	video.destroy = function(){
        if(loaded){
            clearInterval(timeupdate)

            try{
                youtube.destroy()
            }
            catch(e){}
        }

        object.remove()

        listener.destroy()
	}

	call_video(video)

	return object
}

export default YouTube