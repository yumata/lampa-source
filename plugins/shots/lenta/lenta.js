import Video from './video.js'
import Panel from './panel.js'

function Lenta(first, playlist){
    this.html = Lampa.Template.js('shots_lenta')

    this.current  = first
    this.playlist = playlist || []
    this.position = playlist.indexOf(playlist.find(i=>i.id == first.id))
    this.page     = 1
    
    this.start = function(){
        this.video = new Video(this.current)
        this.panel = new Panel(this.current)

        this.video.create()
        this.panel.create()

        if(Lampa.Platform.mouse() || Lampa.Utils.isTouchDevice()){
            let head = Lampa.Template.js('head_backward', {title: ''})
            
            head.find('.head-backward__button').on('click', Lampa.Controller.back.bind(Lampa.Controller))

            this.html.append(head)
        }

        this.html.find('.shots-lenta__video').append(this.video.render())
        this.html.find('.shots-lenta__panel').append(this.panel.render())

        $('body').addClass('ambience--enable').append(this.html)

        this.video.change(this.current, 'next')
        this.panel.change(this.current, 'next')

        this.controller()
        this.scroll()

        this.html.on('mousemove', this.focus.bind(this))

        Lampa.Background.theme('black')
    }

    this.scroll = function(){
        let _self = this

        if(Lampa.Utils.isTouchDevice()){
            let start_position = 0
            let move_position  = 0
            let end_position   = 0
            let time_scroll    = 0
            let elemmove       = this.html.find('.shots-lenta-video__video-element')

            function movestart(e){
                start_position = e.clientY
                end_position   = start_position
                move_position  = start_position
                time_scroll    = Date.now()
            }

            function move(e){
                move_position = e.clientY
                end_position  = e.clientY

                let delta = move_position - start_position

                elemmove.style.transform = 'translateY(' + delta + 'px)'
            }

            function moveend(e){
                elemmove.style.transform = 'translateY(0px)'

                let threshold = window.innerHeight / 2.5

                let csroll_speed = Date.now() - time_scroll

                if(csroll_speed < 200){
                    threshold = threshold / 6
                }

                if(start_position - end_position > threshold){
                    _self.move('next')
                }
                else if(end_position - start_position > threshold){
                    _self.move('prev')
                }

                end_position   = 0
                start_position = 0
                move_position  = 0
            }

            this.html.addEventListener('touchstart',(e)=>{
                movestart(e.touches[0] || e.changedTouches[0])
            })

            this.html.addEventListener('touchmove',(e)=>{
                move(e.touches[0] || e.changedTouches[0])
            })

            this.html.addEventListener('touchend', moveend)
        }
        else{
            let time  = 0

            function wheel(e){
                if(Date.now() - time > 500){
                    time = Date.now()

                    if(e.wheelDelta / 120 > 0) {
                        _self.move('prev')
                    }
                    else{
                        _self.move('next')
                    }
                }
            }
            
            // Обрабатываем скролл колесом мыши
            this.html.addEventListener('mousewheel', wheel)
            this.html.addEventListener('wheel', wheel)
        }
    }

    this.focus = function(){
        if(Lampa.Utils.isTouchDevice()) return

        clearTimeout(this.focus_timeout)

        this.html.toggleClass('shots-lenta--hide-panel', false)

        this.focus_timeout = setTimeout(()=>{
            if(Lampa.Controller.enabled().name !== 'shots_lenta') return

            this.html.toggleClass('shots-lenta--hide-panel', true)

            Lampa.Controller.add('shots_lenta_idle',{
                toggle: ()=>{
                    Lampa.Controller.clear()
                },
                left: this.controller.bind(this),
                right: this.controller.bind(this),
                up: ()=>{
                    this.move('prev')

                    this.focus()
                },
                down: ()=>{
                    this.move('next')

                    this.focus()
                },
                enter: this.controller.bind(this),
                back: this.controller.bind(this)
            })

            Lampa.Controller.toggle('shots_lenta_idle')
        },7000)
    }

    this.controller = function(){
        Lampa.Controller.add('shots_lenta',{
            toggle: ()=>{
                Lampa.Controller.clear()

                Lampa.Controller.collectionSet(this.html)
                Lampa.Controller.collectionFocus(this.panel.last, this.html)

                this.focus()
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')

                this.focus()
            },
            right: ()=>{
                if(Navigator.canmove('right')) Navigator.move('right')

                this.focus()
            },
            up: ()=>{
                this.move('prev')

                this.focus()
            },
            down: ()=>{
                this.move('next')

                this.focus()
            },
            back: this.back.bind(this)
        })

        Lampa.Controller.toggle('shots_lenta')
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

            Lampa.Controller.toggle('shots_lenta')
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

        clearTimeout(this.focus_timeout)

        this.video.destroy()
        this.panel.destroy()

        this.html.remove()

        Lampa.Background.theme('reset')
    }
}

export default Lenta