import Menu from './menu'
import Program from './program'

class HUD{
    constructor(channel, program){
        this.listener = Lampa.Subscribe()

        this.menu    = new Menu(this.listener, channel, program)
        this.program = new Program(this.listener, channel, program)

        this.hud = Lampa.Template.js('cub_iptv_hud')

        this.hud.find('.iptv-hud__menu').append(this.menu.render())
        this.hud.find('.iptv-hud__program').append(this.program.render())

        document.body.find('.player').append(this.hud)

        this.listen()
    }

    create(){
        this.menu.create()
        this.program.create()
        
        this.menu.toggle()
    }

    listen(){
        this.listener.follow('toggle_menu',()=>{
            this.menu.toggle()
        })

        this.listener.follow('toggle_program',()=>{
            this.program.toggle()
        })
    }

    destroy(){
        this.menu.destroy()
        this.program.destroy()

        this.hud.remove()
    }
}

export default HUD