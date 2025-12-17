import Subscribe from '../../utils/subscribe'
import Platform from '../../core/platform'
import Lang from '../../core/lang'
import Panel from './panel' 

function YouTube(call_video){
    let stream_url, loaded

	let needclick = true//Platform.screen('mobile') || navigator.userAgent.toLowerCase().indexOf("android") >= 0

    let object   = $(`<div class="player-video__youtube">
		<div class="player-video__youtube-player" id="youtube-player"></div>
		<div class="player-video__youtube-line-top"></div>
		<div class="player-video__youtube-line-bottom"></div>
		<div class="player-video__youtube-noplayed hide">
			<svg class="player-video__youtube-icon"><use xlink:href="#sprite-youtube"></use></svg>
			<div>${Lang.translate('player_youtube_no_played')}</div>
		</div>
	</div>`)

	let video    = object[0]
    let listener = Subscribe()
	let volume   = 100
    let youtube
    let timeupdate
	let timetapplay
	let screen_size = 2

    function videoSize(){
        let size = {
            width: 0,
            height: 0
        }

        if(youtube){
            let str = '' 
            
            try{
                str = youtube.getPlaybackQuality()
            }
            catch(e){}
            
            if(str == 'highres' || str == 'hd2160'){
                size.width = 3840
                size.height = 2160
            }
			else if(str == 'hd1440'){
				size.width = 2560
                size.height = 1440
			}
            else if(str == 'hd1080'){
                size.width = 1920
                size.height = 1080
            }
			else if(str == 'hd720'){
                size.width = 1280
                size.height = 720
            }
			else{
				size.width = 854
                size.height = 480
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
			if(needclick) return true

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

	Object.defineProperty(video, "volume", { 
		set: function (num) {
			volume = num * 100

			if(youtube) youtube.setVolume(volume)
		},
		get: function(){
            
		}
	});


	/**
	 * Всегда говорим да, мы можем играть
	 */
	video.canPlayType = function(){
		return true
	}

    video.resize = function(){
        object.find('.player-video__youtube-player').width(window.innerWidth * screen_size)
	    object.find('.player-video__youtube-player').height((window.innerHeight + 600) * screen_size)
		object.find('.player-video__youtube-player').addClass('minimize')//.css({transform: 'scale(0.5)'})
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
			let id = stream_url.replace('//youtu.be/', '//www.youtube.com/watch?v=').split('?v=').pop()

            video.resize()

			let nosuport = ()=>{
				object.find('.player-video__youtube-noplayed').removeClass('hide').find('div').text(Lang.translate('player_youtube_no_support'))
			}

			if(typeof YT == 'undefined') return nosuport()
			
			if(typeof YT.Player == 'undefined') return nosuport()

			if(needclick){
				object.append('<div class="player-video__youtube-needclick"><img src="https://img.youtube.com/vi/'+id+'/sddefault.jpg" /><div>'+Lang.translate('loading') + '...' + '</div></div>')

				timetapplay = setTimeout(()=>{
					object.find('.player-video__youtube-needclick div').text(Lang.translate('player_youtube_start_play'))
					
					Panel.update('pause')
				},10000)
			}

			console.log('YouTube','create', stream_url)

			youtube = new YT.Player('youtube-player', {
                height: (window.innerHeight + 600) * screen_size,
                width: window.innerWidth * screen_size,
                playerVars: { 
                    'controls': 1,
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
                videoId: id,
                events: {
                    onReady: (event)=>{
						console.log('YouTube','ready')

                        loaded = true

						youtube.setVolume(volume)

                        listener.send('canplay')

                        listener.send('loadeddata')

                        timeupdate = setInterval(()=>{
                            if(youtube.getPlayerState() !== YT.PlayerState.PAUSED) listener.send('timeupdate')
                        },100)

						if(needclick) listener.send('playing')
                    },
                    onStateChange: (state)=>{
						console.log('YouTube','state',state.data)

                        object.removeClass('ended')

						if(needclick) object.find('.player-video__youtube-needclick div').text(Lang.translate('loading') + '...')

                        if(state.data == YT.PlayerState.PLAYING){
                            listener.send('playing')

							clearTimeout(timetapplay)

							if(needclick){
								needclick = false
								
								setTimeout(()=>{
									object.find('.player-video__youtube-needclick').remove()
								},500)
							}
                        }

                        if(state.data == YT.PlayerState.ENDED){
                            object.addClass('ended')

                            listener.send('ended')
                        }
        
                        if (state.data == YT.PlayerState.BUFFERING) {
                            listener.send('waiting')

							state.target.setPlaybackQuality('hd1080')
                        }
                    },
                    onPlaybackQualityChange: (state)=>{
                        console.log('YouTube','quality',youtube.getPlaybackQuality())
                    },
					onError: (e)=>{
						console.log('YouTube','error',e)

						object.find('.player-video__youtube-noplayed').removeClass('hide')

						object.addClass('ended')

						if(needclick) object.find('.player-video__youtube-needclick').remove()

						clearTimeout(timetapplay)
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

		clearTimeout(timetapplay)

        listener.destroy()
	}

	call_video(video)

	return object
}

export default YouTube