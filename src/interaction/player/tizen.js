import Subscribe from '../../utils/subscribe'

function create(call_video){
    let stream_url, loaded

    let object   = $('<object class="player-video_video" type="application/avplayer"</object>')
	let video    = object[0]
    let listener = Subscribe()

	let change_scale_later

	object.width(window.innerWidth)
	object.height(window.innerHeight)

	// для тестов
	/*
	let webapis = {
		paused: true,
		duration: 500 * 1000,
		position: 0,
		avplay: {
			open: ()=>{
	
			},
			close: ()=>{
				clearInterval(webapis.timer)
			},
			play: ()=>{
				webapis.paused = false
			},
			pause: ()=>{
				webapis.paused = true
			},
			setDisplayRect: ()=>{
	
			},
			setDisplayMethod: ()=>{
	
			},
			seekTo: (t)=>{
				webapis.position = t
			},
			getCurrentTime: ()=>{
				return webapis.position
			},
			getDuration: ()=>{
				return webapis.duration
			},
			getState: ()=>{
				return webapis.paused ? 'PAUSED' : 'PLAYNING'
			},
			getTotalTrackInfo: ()=>{
				return [
					{
						type: 'AUDIO',
						index: 0,
						extra_info: '{"language":"russion"}'
					},
					{
						type: 'AUDIO',
						index: 1,
						extra_info: '{"language":"english"}'
					},
					{
						type: 'TEXT',
						index: 0,
						extra_info: '{"track_lang":"rus"}'
					},
					{
						type: 'TEXT',
						index: 1,
						extra_info: '{"track_lang":"eng"}'
					}
				]
			},
			getCurrentStreamInfo: ()=>{
				return []
			},
			setListener: ()=>{
	
			},
			prepareAsync: (call)=>{
				setTimeout(call, 1000)
	
				webapis.timer = setInterval(()=>{
					if(!webapis.paused) webapis.position += 100

					if(webapis.position >= webapis.duration){
						clearInterval(webapis.timer)

						webapis.position = webapis.duration

						listener.send('ended')
					}

					if(!webapis.paused){
						listener.send('timeupdate')

						let s = webapis.duration / 4,
							t = 'Welcome to subtitles'

						if(webapis.position > s * 3) t = 'That\'s all I wanted to say'
						else if(webapis.position > s * 2) t = 'This is a super taizen player'
						else if(webapis.position > s) t = 'I want to say a few words'

						listener.send('subtitle',{text:  t })
					}
				},30)
			}
		}
	}
	*/

	/**
	 * Установить урл
	 */
	Object.defineProperty(video, "src", { 
		set: function (url) {
			if(url){
				stream_url = url

				webapis.avplay.open(url)

				webapis.avplay.setDisplayRect(0,0,window.innerWidth,window.innerHeight)

				webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_LETTER_BOX')

				try{
					webapis.avplay.setSilentSubtitle(false)
				}
				catch(e){ }
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
				webapis.avplay.seekTo(t*1000)
			}
			catch(e){}
		},
		get: function(){
			let d = 0

			try{
				d = webapis.avplay.getCurrentTime()
			}
			catch(e){}

			return d ? d / 1000 : 0
		}
	});

	/**
	 * Длительность
	 */
	Object.defineProperty(video, "duration", { 
		set: function () { 
			
		},
		get: function(){
			let d = 0

			try{
				d = webapis.avplay.getDuration()
			}
			catch(e){}

			return d ? d / 1000 : 0
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
				return webapis.avplay.getState() == 'PAUSED'
			}
			catch(e){
				return false
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
			let totalTrackInfo = webapis.avplay.getTotalTrackInfo()

            let tracks = totalTrackInfo.filter(function (track) { return track.type === 'AUDIO'}).map(function(track) {
                let info = JSON.parse(track.extra_info)
				let item = {
                    extra: JSON.parse(track.extra_info),
                    index: parseInt(track.index),
                    language: info.language,
                }

				Object.defineProperty(item, "enabled", {
					set: (v)=>{
						if(v){
							try{
								webapis.avplay.setSelectTrack('AUDIO',item.index);
							}
							catch(e){
								console.log('Player','no change audio:', e.message)
							}
						}
					},
					get: ()=>{}
				})

                return item
            }).sort(function(a, b) {
                return a.index - b.index
            })

            return tracks
		}
	});

	/**
	 * Субтитры
	 */
	Object.defineProperty(video, "textTracks", { 
		set: function () { 
			
		},
		get: function(){
			try{
				let totalTrackInfo = webapis.avplay.getTotalTrackInfo()

				let tracks = totalTrackInfo.filter(function (track) { return track.type === 'TEXT'}).map(function(track) {
					let info = JSON.parse(track.extra_info),
						item = {
							extra: JSON.parse(track.extra_info),
							index: parseInt(track.index),
							language: info.track_lang,
						}

					Object.defineProperty(item, "mode", {
						set: (v)=>{
							if(v == 'showing'){
								try{
									webapis.avplay.setSelectTrack('TEXT',item.index);
								}
								catch(e){
									console.log('Player','no change text:',e.message)
								}
							}
						},
						get: ()=>{}
					})

					return item
				}).sort(function(a, b) {
					return a.index - b.index
				})

				return tracks;
			}
			catch(e){
				return []
			}
		}
	});

	Object.defineProperty(video, "videoWidth", { 
		set: function () { 
			
		},
		get: function(){
			let info = videoInfo()

			return info.Width || 0
		}
	});

	Object.defineProperty(video, "videoHeight", { 
		set: function () { 
			
		},
		get: function(){
			let info = videoInfo()

			return info.Height || 0
		}
	});

	/**
	 * Получить информацию о видео
	 * @returns Object
	 */
	const videoInfo = function(){
		try{
			let info = webapis.avplay.getCurrentStreamInfo(),
				json = {}

			for (let i = 0; i < info.length; i++) {
				let detail = info[i];

				if(detail.type == 'VIDEO'){
					json = JSON.parse(detail.extra_info);
				}
			}
			
			return json
		}
		catch(e){
			return {}
		}
	}

	/**
	 * Меняем размер видео
	 * @param {String} scale - default,cover
	 */
	const changeScale = function(scale){
		try{
			if(scale == 'cover'){
				webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_FULL_SCREEN')
			}
			else{
				webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_LETTER_BOX')
			}
		}
		catch(e){
			change_scale_later = scale;
		}
	}

	/**
	 * Всегда говорим да, мы можем играть
	 */
	video.canPlayType = function(){
		return true;
	}

	/**
	 * Вешаем кастомные события
	 */
    video.addEventListener = listener.follow.bind(listener)
	
	/**
	 * Вешаем события от плеера тайзен
	 */
	webapis.avplay.setListener({
		onbufferingstart: function() {
			console.log('Player','buffering start')

            listener.send('waiting')
		},

		onbufferingprogress: function(percent) {
            listener.send('progress',{percent: percent})	
		},

		onbufferingcomplete: function() {
			console.log('Player','buffering complete')

            listener.send('playing')
		},
		onstreamcompleted: function() {
			console.log('Player','stream completed');

			webapis.avplay.stop()

            listener.send('ended')
		},

		oncurrentplaytime: function() {
            listener.send('timeupdate')

			if(change_scale_later){
				change_scale_later = false

				changeScale(change_scale_later)
			}
		},

		onerror: function(eventType) {
            listener.send('error',{error:{code: 'tizen',message: eventType}})
		},

		onevent: function(eventType, eventData) {
			console.log('Player','event type:',eventType,'data:',eventData);
		},

		onsubtitlechange: function(duration, text, data3, data4) {
            listener.send('subtitle',{text:text})
		},
		ondrmevent: function(drmEvent, drmData) {
			
		}
	})

	/**
	 * Загрузить
	 */
	video.load = function(){
		if(stream_url){
			webapis.avplay.prepareAsync(()=>{
				loaded = true

				webapis.avplay.play()

				try{
					webapis.avplay.setSilentSubtitle(false)
				}
				catch(e){ }

				listener.send('canplay')

				listener.send('playing')

				listener.send('loadedmetadata')
			},(e)=>{
				listener.send('error',{error: 'code ['+e.code+'] ' + e.message})
			})
		}
	}

	/**
	 * Играть
	 */
	video.play = function(){
		if(loaded) webapis.avplay.play()
	}

	/**
	 * Пауза
	 */
	video.pause = function(){
		if(loaded) webapis.avplay.pause()
	}

	/**
	 * Установить масштаб
	 */
	video.size = function(type){
		changeScale(type)
	}

	/**
	 * Уничтожить
	 */
	video.destroy = function(){
		try{
			webapis.avplay.close()
		}
		catch(e){}
		
        video.remove()

        listener.destroy()
	}

	call_video(video)

	return object
}

export default create