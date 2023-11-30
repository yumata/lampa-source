import Favorites from '../utils/favorites'

class HUDMenu{
    constructor(listener, channel){
        this.listener = listener
        this.channel  = channel

        this.html = document.createElement('div')
    }

    create(){
        let info = $(`
            <div class="iptv-hud-menu-info">
                <div class="iptv-hud-menu-info__group">${this.channel.group}</div>
                <div class="iptv-hud-menu-info__name">${this.channel.name}</div>
            </div>
        `)[0]

        let favorite = this.button(Lampa.Template.get('cub_iptv_icon_favorite', {}, true), Lampa.Lang.translate('settings_input_links'), ()=>{
            Favorites.toggle(this.channel).finally(()=>{
                favorite.toggleClass('active', Boolean(Favorites.find(this.channel)))

                this.listener.send('action-favorite')
            })
        })

        favorite.toggleClass('active', Boolean(Favorites.find(this.channel)))

        this.html.append(info)
        this.html.append(favorite)
    }

    button(icon, text, call){
        let button = $(`
            <div class="iptv-hud-menu-button selector">
                <div class="iptv-hud-menu-button__icon">${icon}</div>
                <div class="iptv-hud-menu-button__text">${text}</div>
            </div>
        `)

        button.on('hover:enter',call)

        return button[0]
    }

    toggle(){
        Lampa.Controller.add('player_iptv_hud_menu',{
            toggle: ()=>{
                Lampa.Controller.collectionSet(this.render())
                Lampa.Controller.collectionFocus(false,this.render())
            },
            up: ()=>{
                
            },
            down: ()=>{
                
            },
            right: ()=>{
                this.listener.send('toggle_program')
            },
            gone: ()=>{
                let focus = this.html.find('.focus')

                if(focus) focus.removeClass('focus')
            },
            back: ()=>{
                this.listener.send('close')
            }
        })

        Lampa.Controller.toggle('player_iptv_hud_menu')
    }

    render(){
        return this.html
    }

    destroy(){

    }
}

export default HUDMenu