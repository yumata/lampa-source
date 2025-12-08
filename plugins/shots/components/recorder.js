import Utils from '../utils/utils.js'
import Defined from '../defined.js'

function Recorder(video){
    this.html = Lampa.Template.get('shots_player_recorder')

    let fps    = 0
    let stoped = false
    let paused = false
    let chunks = []

    let start_point = video.currentTime
    let end_point   = start_point

    this.start = function(){
        try{
            let _self  = this
            let canvas = document.createElement("canvas")
            let scale  = Defined.video_size / video.videoWidth
            let width  = Math.round(video.videoWidth * scale)
            let height = Math.round(video.videoHeight * scale)

            canvas.width  = width
            canvas.height = height

            let stream_ctx   = canvas.getContext("2d")
            let stream_video = canvas.captureStream()

            let last_time = performance.now()
            let smoothing = 0.8
            
            function draw(now) {
                let delta   = now - last_time
                let current = 1000 / delta

                end_point = video.currentTime

                last_time = now
                
                fps = fps * smoothing + current * (1 - smoothing)

                stream_ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

                if(!(stoped || paused)) video.requestVideoFrameCallback(draw)
            }

            function listenerWaiting(){
                paused = true

                _self.recorder.pause()
            }

            function listenerPlaying(){
                paused = false

                _self.recorder.resume()

                video.requestVideoFrameCallback(draw)
            }

            let audio_stream = video.captureStream()
            let audio_track  = audio_stream.getAudioTracks()[0]

            console.log('Recorder', 'Video and audio tracks:', audio_stream.getAudioTracks())

            if (!audio_track){
                throw new Error('No audio track found in video stream')
            }

            if (!audio_track.readyState){
                throw new Error('Audio track is dead')
            }

            let mixed_stream = new MediaStream()

            // Добавляем видео и аудио дорожки в общий поток
            stream_video.getTracks().forEach(track => mixed_stream.addTrack(track))
            mixed_stream.addTrack(audio_track)

            let options = {
                //mimeType: 'video/webm;codecs=vp8,opus', // слишком прожорлив
                mimeType: 'video/webm;codecs=h264',
                videoBitsPerSecond: 6000000,
                audioBitsPerSecond: 128000
            }

            this.recorder = new MediaRecorder(mixed_stream, options)

            this.recorder.ondataavailable = e => chunks.push(e.data)

            this.recorder.onstop = () => {
                stoped = true

                video.removeEventListener('waiting', listenerWaiting)
                video.removeEventListener('playing', listenerPlaying)

                //mixed_stream.getTracks().forEach(t => t.stop())

                let elapsed = end_point - start_point

                if(elapsed < 1){
                    this.error(new Error('Stoped too early, maybe codecs not supported'))
                }
                else{
                    let blob = new Blob(chunks, { type: 'video/webm' })

                    this.destroy()

                    this.onStop({
                        duration: Math.round(elapsed),
                        blob: blob,
                        screenshot: this.screenshot,
                        start_point: Math.round(start_point),
                        end_point: Math.round(end_point)
                    })
                }
            }

            this.screenshot = Utils.videoScreenShot(video, Defined.screen_size)

            this.run()

            video.requestVideoFrameCallback(draw)

            setTimeout(()=>{
                this.recorder.start()

                video.addEventListener('waiting', listenerWaiting)
                video.addEventListener('playing', listenerPlaying)
            },100)

            this.html.find('.shots-player-recorder__stop').on('click', this.stop.bind(this))
        }
        catch(e){
            console.error('Recorder', e.message)

            this.error(e)
        }
    }

    this.run = function(){
        $('body').append(this.html)

        Lampa.Controller.add('recorder',{
            toggle: ()=>{
                Lampa.Controller.clear()
            },
            enter: this.stop.bind(this),
            back: this.stop.bind(this)
        })

        Lampa.Controller.toggle('recorder')

        this.interval = setInterval(this.tik.bind(this), 1000)

        this.tik()

        this.onRun()
    }

    this.tik = function(){
        let seconds  = Math.round(end_point - start_point)
        let progress = Lampa.Utils.secondsToTime(seconds).split(':')
            progress = progress[1] + ':' + progress[2]

        this.html.find('.shots-player-recorder__text span').text(progress + ' / ' + Lampa.Utils.secondsToTimeHuman(Defined.recorder_max_duration) + (fps ? ` - ${fps.toFixed(1)}` : ''))

        if(seconds >= Defined.recorder_max_duration) this.stop()
    }

    this.error = function(e){
        this.destroy()

        this.onError(e)
    }

    this.stop = function(){
        this.recorder.stop()
    }

    this.destroy = function(){
        chunks = []

        clearInterval(this.interval)

        this.html.remove()
    }
}

export default Recorder