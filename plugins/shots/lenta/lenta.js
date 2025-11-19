import Video from './video.js'
import Panel from './panel.js'

function Lenta(first, playlist){
    this.html = Lampa.Template.js('shots_lenta')

    this.current  = first
    this.playlist = playlist || []
    this.position = playlist.indexOf(first)
    this.page     = 1
    
    this.start = function(){
        this.video = new Video(this.current)
        this.panel = new Panel(this.current)

        this.video.create()
        this.panel.create()

        this.html.find('.shots-lenta__video').append(this.video.render())
        this.html.find('.shots-lenta__panel').append(this.panel.render())

        $('body').addClass('ambience--enable').append(this.html)

        this.video.change(this.current, 'next')
        this.panel.change(this.current, 'next')

        this.controller()
    }

    this.controller = function(){
        Lampa.Controller.add('shots_lenta_video',{
            toggle: ()=>{
                Lampa.Controller.clear()

                this.video.toggle()
            },
            right: ()=>{
                Lampa.Controller.toggle('shots_lenta_panel')
            },
            up: ()=>{
                this.move('prev')
            },
            down: ()=>{
                this.move('next')
            },
            back: this.back.bind(this)
        })

        Lampa.Controller.add('shots_lenta_panel',{
            toggle: ()=>{
                Lampa.Controller.clear()

                this.panel.toggle()
            },
            left: ()=>{
                Lampa.Controller.toggle('shots_lenta_video')
            },
            up: ()=>{
                
            },
            down: ()=>{

            },
            back: this.back.bind(this)
        })

        Lampa.Controller.toggle('shots_lenta_video')
    }

    this.move = function(direction){
        let start_position = this.position

        if(direction == 'next'){
            this.position++

            if(this.position >= this.playlist.length){
                this.position = this.playlist.length - 1
            }
        }
        else if(direction == 'prev'){
            this.position--

            if(this.position < 0){
                this.position = 0
            }
        }

        if(start_position !== this.position){
            this.current = this.playlist[this.position]

            this.video.change(this.current, direction)
            this.panel.change(this.current, direction)

            Lampa.Controller.toggle('shots_lenta_video')
        }

        if(this.position >= this.playlist.length - 3){
            this.nextPart()
        }
    }

    this.nextPart = function(){
        if(this.onNext){
            this.loading_part = true

            this.page++

            this.onNext(this.page, (results)=>{
                this.loading_part = false

                if(results && results.length) this.playlist = this.playlist.concat(results)
            })
        }
    }

    this.back = function(){
        this.destroy()

        Lampa.Controller.toggle('content')
    }

    this.destroy = function(){
        console.log('Lenta destroy')

        this.video.destroy()
        this.panel.destroy()

        this.html.remove()
    }
}

export default Lenta