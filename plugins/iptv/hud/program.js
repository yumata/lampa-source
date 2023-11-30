class HUDProgram{
    constructor(listener, channel, program){
        this.listener = listener
        this.channel  = channel

        this.html = document.createElement('div')
    }

    create(){
        this.listener.follow('set_program_endless',(event)=>{
            this.endless = event.endless

            this.html.append(event.endless.render())
        })

        this.listener.send('get_program_endless')
    }

    toggle(){
        Lampa.Controller.add('player_iptv_hud_program',{
            toggle: ()=>{
                Lampa.Controller.collectionSet(this.render())
                Lampa.Controller.collectionFocus(false,this.render())
            },
            up: ()=>{
                this.endless.move(-1)

                Lampa.Controller.collectionSet(this.render())
                Lampa.Controller.collectionFocus(false,this.render())
            },
            down: ()=>{
                this.endless.move(1)

                Lampa.Controller.collectionSet(this.render())
                Lampa.Controller.collectionFocus(false,this.render())
            },
            left: ()=>{
                this.listener.send('toggle_menu')
            },
            gone: ()=>{
                let focus = this.html.find('.focus')

                if(focus) focus.removeClass('focus')
            },
            back: ()=>{
                this.listener.send('close')
            }
        })

        Lampa.Controller.toggle('player_iptv_hud_program')
    }

    render(){
        return this.html
    }

    destroy(){

    }
}

export default HUDProgram