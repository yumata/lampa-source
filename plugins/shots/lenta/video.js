import Roll from '../utils/roll.js'

function Video(){
    this.html     = Lampa.Template.js('shots_lenta_video')
    this.video    = this.html.find('video')
    this.progress = this.html.find('.shots-lenta-video__progress-bar div')
    this.layer    = this.html.find('.shots-lenta-video__layer')
    this.loader   = this.html.find('.shots-lenta-video__loader')
    this.viewed   = {}

    this.create = function(){
        this.video.addEventListener('timeupdate', ()=>{
            this.progress.style.width = (this.video.currentTime / this.video.duration * 100) + '%'

            if((this.video.currentTime / this.video.duration > 0.1 || this.video.currentTime > 2) && !this.viewed[this.shot.id]){
                this.viewed[this.shot.id] = true

                Roll.viewedRegister(this.shot)
            }

            Lampa.Screensaver.resetTimer()
        })

        this.video.addEventListener('waiting', ()=>{
            this.showLoading()
        })

        this.video.addEventListener('playing', ()=>{
            this.hideLoading()
        })

        this.layer.on('click',()=>{
            this.video.paused ? this.play() : this.pause()
        })

        if(Lampa.Platform.is('apple')) this.video.setAttribute('playsinline', 'true')
    }

    this.change = function(shot){
        this.shot = shot

        if(shot.from_id) Roll.saveFromId(shot.from_id)

        this.video.setAttribute('poster', shot.img || './img/video_poster.png')
        this.progress.style.width = '0%'

        this.pause()
        this.load()
        this.play()
    }

    this.play = function(){
        let playPromise

        try{
            playPromise = this.video.play()
        }
        catch(e){ }


        if (playPromise !== undefined) {
            playPromise.then(function(){
                console.log('Lenta','start plaining')
            }).catch(function(e){
                console.log('Lenta','play promise error:', e.message)
            })
        }
    }

    this.pause = function(){
        let pausePromise

        try{
            pausePromise = this.video.pause()
        }
        catch(e){ }

        if (pausePromise !== undefined) {
            pausePromise.then(function(){
                console.log('Lenta','pause')
            })
            .catch(function(e){
                console.log('Lenta','pause promise error:', e.message)
            })
        }
    }

    this.load = function(){
        this.video.src = ''
        this.video.load()

        this.video.src = this.shot.file
        this.video.load()
    }

    this.showLoading = function(){
        this.timer_loading = setTimeout(()=>{
            this.loader.addClass('show')
        },2000)
    }

    this.hideLoading = function(){
        clearTimeout(this.timer_loading)

        this.loader.removeClass('show')
    }

    this.render = function(){
        return this.html
    }

    this.destroy = function(){
        clearTimeout(this.timer_loading)

        this.html.remove()

        this.viewed = {}
    }
}

export default Video