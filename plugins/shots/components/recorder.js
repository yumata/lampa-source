import Utils from '../utils/utils.js'

function Recorder(video){
    this.html = Lampa.Template.get('shots_player_recorder')

    this.start_time   = Date.now()
    this.max_duration = 60 * 5 // 5 минут

    this.start = function(){
        try{
            let stream  = video.captureStream()
            let options = { 
                mimeType: 'video/webm;codecs=vp9',
                videoBitsPerSecond: 1000000,
                audioBitsPerSecond: 128000 
            }

            this.recorder = new MediaRecorder(stream, options)

            let chunks = []

            this.recorder.ondataavailable = e => chunks.push(e.data)
            this.recorder.onstop = () => {
                let blob = new Blob(chunks, { type: 'video/webm' })

                this.destroy()

                this.onStop({
                    duration: (Date.now() - this.start_time) / 1000,
                    blob: blob,
                    screenshot: this.screenshot
                })
            }

            this.screenshot = Utils.videoScreenShot(video, 500)

            this.run()

            this.recorder.start()
        }
        catch(e){
            this.error(e)
        }
    }

    this.run = function(){
        $('body').append(this.html)

        Lampa.Controller.add('recorder',{
            toggle: ()=>{
                Lampa.Controller.clear()
            },
            back: this.stop.bind(this)
        })

        Lampa.Controller.toggle('recorder')

        this.interval = setInterval(this.tik.bind(this), 1000)

        this.tik()

        this.onRun()
    }

    this.tik = function(){
        let duration = Date.now() - this.start_time
        let seconds  = duration / 1000
        let progress = Lampa.Utils.secondsToTime(seconds).split(':')
            progress = progress[1] + ':' + progress[2]

        this.html.find('.shots-player-recorder__text span').text(progress + ' / ' + Lampa.Utils.secondsToTimeHuman(this.max_duration))
    }

    this.error = function(e){
        this.destroy()

        this.onError(e)
    }

    this.stop = function(){
        this.recorder.stop()
    }

    this.destroy = function(){
        clearInterval(this.interval)

        this.html.remove()
    }
}

export default Recorder