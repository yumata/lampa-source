function backward(){
    let head = Lampa.Template.get('head_backward',{title: ''})

    head.find('.head-backward__button').on('click',()=>{
        Lampa.Controller.back()
    })

    return head
}

function Present(){
    this.onComplete = ()=>{}
    this.onBack     = ()=>{}

    this.start = function(){
        let last_time_watched = Lampa.Storage.get('shots_present_watched', '0')
        let wait_time = 1000 * 60 * 60 * 24 * 30 // 5 дней

        if(Date.now() - last_time_watched < wait_time){
            return this.onComplete()
        }

        Lampa.Background.theme('black')

        this.html = $(`<div class="shots-video-present">
            <video autoplay poster="./img/video_poster.png"></video>
        </div>`)

        if(Lampa.Platform.mouse() || Lampa.Utils.isTouchDevice()){
            this.html.append(backward())
        }

        this.video = this.html.find('video')[0]

        if(Lampa.Platform.is('apple')) this.video.setAttribute('playsinline', 'true')

        this.video.src = 'https://cdn.cub.rip/shots_present/present.mp4'

        this.video.load()

        this.video.addEventListener('ended',this.stop.bind(this))

        this.video.addEventListener('error',this.stop.bind(this))

        this.video.addEventListener('timeupdate',()=>{
            clearTimeout(this.timer_waite)
        })

        this.timer_waite = setTimeout(this.stop.bind(this), 6000)

        $('body').append(this.html)

        Lampa.Controller.add('shots_video_present',{
            toggle: ()=>{
                Lampa.Controller.clear()
            },
            back: this.back.bind(this)
        })

        Lampa.Controller.toggle('shots_video_present')
    }

    this.stop = function(){
        this.onComplete()

        Lampa.Storage.set('shots_present_watched', Date.now())
    }

    this.back = function(){
        this.onBack()
    }
    
    this.destroy = function(){
        this.stop = ()=>{}
        this.onComplete = ()=>{}
        this.onBack = ()=>{}

        if(!this.video) return

        this.video.pause()
        this.video.src = ''

        clearTimeout(this.timer_waite)

        this.html.remove()

        Lampa.Background.theme('reset')
    }
}

export default Present