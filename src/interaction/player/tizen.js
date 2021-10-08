import Subscribe from '../../utils/subscribe'

function create(){
    let stream_url,
        loaded

    let video    = $('<object class="player-video_video" type="application/avplayer"</object>')
    let listener = Subscribe()

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

	Object.defineProperty(video, "currentTime", { 
		set: function (t) { 
			webapis.avplay.seekTo(t*1000);
		},
		get: function(){
			return webapis.avplay.getCurrentTime() / 1000
		}
	});

	Object.defineProperty(video, "duration", { 
		set: function () { 
			
		},
		get: function(){
			return webapis.avplay.getDuration() / 1000
		}
	});

	Object.defineProperty(video, "paused", { 
		set: function () { 
			
		},
		get: function(){
			return webapis.avplay.getState() == 'PAUSED';
		}
	});

	Object.defineProperty(video, "audioTracks", { 
		set: function () { 
			
		},
		get: function(){
			let totalTrackInfo = webapis.avplay.getTotalTrackInfo()

            let tracks = totalTrackInfo.filter(function (track) { return track.type === 'AUDIO'}).map(function(track) {
                var info = JSON.parse(track.extra_info)

                return {
                    extra: JSON.parse(track.extra_info),
                    index: parseInt(track.index),
                    language: info.language,
                }
            }).sort(function(a, b) {
                return a.index - b.index
            })

            return tracks
		}
	});


	Object.defineProperty(video, "textTracks", { 
		set: function () { 
			
		},
		get: function(){
            let totalTrackInfo = webapis.avplay.getTotalTrackInfo()

            let tracks = totalTrackInfo.filter(function (track) { return track.type === 'TEXT'}).map(function(track) {
                var info = JSON.parse(track.extra_info)

                return {
                    extra: JSON.parse(track.extra_info),
                    index: parseInt(track.index),
                    language: info.track_lang,
                }
            }).sort(function(a, b) {
                return a.index - b.index
            })


			return tracks;
		}
	});

	const videoInfo = function(){
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


	video.audioTracksToggle = function(i){
		console.log('Player','toggle audio ['+i+']')

		try{
			webapis.avplay.setSelectTrack('AUDIO',i);
		}
		catch(e){
			console.log('Player','no change audio:', e.message)
		}
		
	}

	video.textTracksToggle = function(i){
		console.log('Player','toggle text ['+i+']')

		try{
			webapis.avplay.setSelectTrack('TEXT',i);
		}
		catch(e){
			console.log('Player','no change text:',e.message)
		}
	}

	video.canPlayType = function(){
		return true;
	}

    video.addEventListener = listener.follow.bind(listener)
	

	webapis.avplay.setListener({
		onbufferingstart: function() {
			console.log('Player','buffering start')

            listener.send('waiting')
            listener.send('tizen_progress_start')
		},

		onbufferingprogress: function(percent) {
            listener.send('tizen_progress',{percent: percent})	
		},

		onbufferingcomplete: function() {
			console.log('Player','buffering complete')

            listener.send('playing')
            listener.send('tizen_progress_end')
		},
		onstreamcompleted: function() {
			console.log('Player','stream completed');

			webapis.avplay.stop()

            listener.send('ended')
		},

		oncurrentplaytime: function() {
            listener.send('timeupdate')
		},

		onerror: function(eventType) {
            listener.send('error',{error:eventType})
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

	video.load = function(){
		if(stream_url){
			var successCallback = function() {
				loaded = true;

				webapis.avplay.play();

				try{
					webapis.avplay.setSilentSubtitle(false);
				}
				catch(e){ }

				dispath.dispatchEvent({type: 'canplay'})
				dispath.dispatchEvent({type: 'playing'})
			}

			var errorCallback = function(e) {
				dispath.dispatchEvent({type: 'tizen_error', error: 'code ['+e.code+'] ' + e.message})
			}

			webapis.avplay.prepareAsync(successCallback,errorCallback);
		}
	}

	video.play = function(){
		if(loaded) webapis.avplay.play()
	}

	video.pause = function(){
		if(loaded) webapis.avplay.pause()
	}

	this.destroy = function(){
		webapis.avplay.close()

        video.remove()

        listener.destroy()
	}
}

export default create