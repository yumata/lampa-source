function Video(){
    this.html     = Lampa.Template.js('shots_lenta_video')
    this.video    = this.html.find('video')
    this.progress = this.html.find('.shots-lenta-video__progress-bar div')
    this.layer    = this.html.find('.shots-lenta-video__layer')

    this.create = function(){
        this.video.addEventListener('timeupdate', ()=>{
            this.progress.style.width = (this.video.currentTime / this.video.duration * 100) + '%'
        })

        this.layer.on('hover:enter',()=>{
            this.video.paused ? this.play() : this.pause()
        })
    }

    this.change = function(shot, direction){
        this.shot = shot

        this.video.setAttribute('poster', shot.img || './img/video_poster.png')
        this.progress.style.width = '0%'

        Lampa.Background.change(shot.img || '')

        this.pause()
        this.load()
        this.play()

        //this.animate(direction)
    }

    this.animate = function(direction){
        let anim_class = 'shots-lenta-video--anim-down'

        if(direction == 'next') anim_class = 'shots-lenta-video--anim-up'

        this.html.addClass(anim_class)

        setTimeout(()=>{
            this.html.removeClass(anim_class)
        }, 300)
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

    this.toggle = function(){
        Lampa.Controller.collectionSet(this.html)
        Lampa.Controller.collectionFocus(this.layer, this.html)
    }

    this.render = function(){
        return this.html
    }

    this.destroy = function(){
        this.html.remove()
    }
}

export default Video