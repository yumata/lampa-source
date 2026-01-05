import Utils from '../utils/utils.js'
import Defined from '../defined.js'
import Metric from '../utils/metric.js'

let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        try{
            audioCtx = new AudioContext()
        }
        catch(e){
            console.error('Recorder', 'Failed to create AudioContext:', e)
        }
    }

    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume()
    }

    return audioCtx
}

function Recorder(video){
    this.html = Lampa.Template.get('shots_player_recorder')

    let fps    = 0
    let stoped = false
    let paused = false
    let chunks = []

    let start_point = video.currentTime
    let end_point   = start_point

    this.start = function(){
        Metric.counter('shots_recorder_start')
        
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

            let mixed_stream = new MediaStream()

            let ac_context
            let ac_source
            let ac_dest
            
            if(video.captureStream){
                let audio_stream = video.captureStream()
                let audio_track  = audio_stream.getAudioTracks()[0]

                console.log('Recorder', 'Video and audio tracks:', audio_stream.getAudioTracks())

                if (!audio_track){
                    throw new Error('No audio track found in video stream')
                }

                if (!audio_track.readyState){
                    throw new Error('Audio track is dead')
                }

                // Добавляем видео и аудио дорожки в общий поток
                stream_video.getTracks().forEach(track => mixed_stream.addTrack(track))
                mixed_stream.addTrack(audio_track)
            }
            else{
                console.log('Recorder', 'Using AudioContext to extract audio track')
                
                ac_context = getAudioContext()

                if(!ac_context) throw new Error('Could not create AudioContext')

                ac_source = video.record_source || ac_context.createMediaElementSource(video)

                video.record_source = ac_source

                ac_dest = ac_context.createMediaStreamDestination()

                ac_source.connect(ac_context.destination)

                ac_source.connect(ac_dest)

                let audio_track = ac_dest.stream.getAudioTracks()[0]

                if (!audio_track) {
                    console.error("No audio track generated")
                }

                stream_video.getTracks().forEach(t => mixed_stream.addTrack(t))
                mixed_stream.addTrack(audio_track)
            }

            let options = {
                mimeType: 'video/webm;codecs=h264',
                videoBitsPerSecond: 5000000,
                audioBitsPerSecond: 128000,
                //bitsPerSecond: 6000000
            }

            var mimeTypes = [
                'video/webm;codecs=h264,opus',
                'video/mp4;codecs=h264,aac',
                'video/webm;codecs=h264',
                'video/mp4',
                'video/webm;codecs=vp8,opus',
                'video/webm;codecs=vp9,opus',
                'video/webm'
            ];

            // Для iOS предпочитаем mp4 если поддерживается
            if (!video.captureStream) {
                mimeTypes = [
                    // 'video/mp4;codecs=h264,aac',
                    // 'video/mp4;codecs=avc1,mp4a',
                    // 'video/mp4',
                    // 'video/webm;codecs=h264,opus',
                    'video/webm;codecs=vp8,opus',
                    'video/webm'
                ];
            }

            for (var i = 0; i < mimeTypes.length; i++) {
                if (MediaRecorder.isTypeSupported(mimeTypes[i])) {
                    options.mimeType = mimeTypes[i];
                    console.log('Recorder', 'Using mimeType:', options.mimeType);
                    break;
                }
            }

            this.recorder = new MediaRecorder(mixed_stream, options)

            this.recorder.ondataavailable = e => chunks.push(e.data)

            this.recorder.onstop = () => {
                stoped = true

                video.removeEventListener('waiting', listenerWaiting)
                video.removeEventListener('playing', listenerPlaying)

                if(ac_source){
                    try { ac_dest.disconnect() } catch {}
                }

                let elapsed = end_point - start_point

                if(elapsed < 1){
                    this.error(new Error('Stoped too early, maybe codecs not supported'))
                }
                else{
                    let type = options.mimeType.split(';')[0]
                    let blob = new Blob(chunks, { type })

                    this.destroy()

                    this.onStop({
                        duration: Math.round(elapsed),
                        blob: blob,
                        screenshot: this.screenshot,
                        start_point: Math.round(start_point),
                        end_point: Math.round(end_point)
                    })

                    Metric.counter('shots_recorder_end')
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

        Metric.counter('shots_recorder_error')
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