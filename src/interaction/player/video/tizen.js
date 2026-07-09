import Subscribe from '../../utils/subscribe'

function AVPlay(call_video){
    let stream_url, loaded

	console.log('Player','run Tizen')

    let object   = $('<object class="player-video_video" type="application/avplayer"</object>')
	let video    = object[0]
    let listener = Subscribe()

	let change_scale_later
	let change_speed_later

	object.width(window.innerWidth)
	object.height(window.innerHeight)

	/**
	 * Установить урл
	 */
	Object.defineProperty(video, "src", { 
		set: function (url) {
			if(url){
				stream_url = url

				try{
					webapis.avplay.open(url)

					webapis.avplay.setDisplayRect(0,0,window.innerWidth,window.innerHeight)

					webapis.avplay.setDisplayMethod('PLAYER_DISPLAY_MODE_LETTER_BOX')
				}
				catch(e){
					listener.send('error',{error:{code: 'tizen',message: 'failed to initialize player'}})
				}

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
			try{
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
									webapis.avplay.setSelectTrack('AUDIO',item.index)
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
			catch(e){
				return []
			}
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

				console.log('Tizen','tracks', tracks)
				console.log('Tizen','tracks index', tracks.map(a=>a.index))

				return tracks;
			}
			catch(e){
				return []
			}
		}
	});

	/**
	 * Ширина видео
	 */
	Object.defineProperty(video, "videoWidth", { 
		set: function () { 
			
		},
		get: function(){
			let info = videoInfo()

			return info.Width || 0
		}
	});

	/**
	 * Высота видео
	 */
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
	 * @returns {object}
	 */
	function videoInfo(){
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
	 * @param {string} scale - default|cover
	 */
	function changeScale(scale){
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

	function changeSpeed(speed){
		try{
			webapis.avplay.setSpeed(speed)
		}
		catch(e){
			change_speed_later = speed;
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
			listener.send('progress',{percent: 0})

            listener.send('waiting')
		},

		onbufferingprogress: function(percent) {
            listener.send('progress',{percent: percent})	
		},

		onbufferingcomplete: function() {
			listener.send('progress',{percent: 0})

            listener.send('playing')
		},
		onstreamcompleted: function() {
			webapis.avplay.stop()

            listener.send('ended')
		},

		oncurrentplaytime: function() {
            listener.send('timeupdate')

			if(change_scale_later){
				change_scale_later = false

				changeScale(change_scale_later)
			}

			if(change_speed_later){
				change_speed_later = false

				changeSpeed(change_speed_later)
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

				listener.send('loadeddata')
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
	 * Установить скорость
	 */
	 video.speed = function(speed){
		changeSpeed(speed)
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

export default AVPlay