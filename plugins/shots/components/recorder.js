import Utils from '../utils/utils.js'
import Defined from '../defined.js'
import Metric from '../utils/metric.js'


function Recorder(video){
    this.html = Lampa.Template.get('shots_player_recorder')

    let start_point = video.currentTime

    this.start = function(){
        Metric.counter('shots_recorder_start')
        
        try{
            this.screenshot = Utils.videoScreenShot(video, Defined.screen_size)

            this.run()
        }
        catch(e){
            console.error('Recorder', e.message)

            this.error(e)
        }
    }

    this.run = function(){
        $('body').append(this.html)

        let button_stop = this.html.find('.shots-player-recorder__stop')
        let button_forward = this.html.find('.shots-player-recorder__forward')
        let button_rewind = this.html.find('.shots-player-recorder__rewind')

        button_stop.on('hover:enter', this.stop.bind(this))

        button_forward.on('hover:enter', ()=>{
            if(video.currentTime < start_point + Defined.recorder_max_duration){
                video.currentTime += 5
                this.tik()
            }
        })

        button_rewind.on('hover:enter', ()=>{
            if(video.currentTime - 10 > start_point){
                video.currentTime -= 5
                this.tik()
            }
        })

        Lampa.Controller.add('recorder',{
            toggle: ()=>{
                Lampa.Controller.collectionSet(this.html)
                Lampa.Controller.collectionFocus(button_stop, this.html)
            },
            left: ()=>{
                Navigator.move('left')
            },
            right: ()=>{
                Navigator.move('right')
            },
            back: this.stop.bind(this)
        })

        Lampa.Controller.toggle('recorder')

        this.interval = setInterval(this.tik.bind(this), 1000)

        this.tik()

        this.onRun()
    }

    this.tik = function(){
        let seconds  = Math.round(video.currentTime - start_point)
        let progress = Lampa.Utils.secondsToTime(seconds).split(':')
            progress = progress[1] + ':' + progress[2]

        this.html.find('.shots-player-recorder__text span').text(progress + ' / ' + Lampa.Utils.secondsToTimeHuman(Defined.recorder_max_duration))

        if(seconds >= Defined.recorder_max_duration) this.stop()
    }

    this.error = function(e){
        this.destroy()

        this.onError(e)

        Metric.counter('shots_recorder_error')
    }

    this.stop = function(){
        let elapsed = video.currentTime - start_point

        if(elapsed < 1){
            this.error(new Error('Stoped too early, maybe codecs not supported'))
        }
        else{
            this.destroy()

            this.onStop({
                duration: Math.round(elapsed),
                screenshot: this.screenshot,
                start_point: Math.round(start_point),
                end_point: Math.round(video.currentTime)
            })

            Metric.counter('shots_recorder_end')
        }
    }

    this.destroy = function(){
        clearInterval(this.interval)

        this.html.remove()
    }
}

export default Recorder