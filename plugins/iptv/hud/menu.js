import Favorites from '../utils/favorites'
import Locked from '../utils/locked'

class HUDMenu{
    constructor(listener, channel){
        this.listener = listener
        this.channel  = channel
        this.original = channel.original

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
            Favorites.toggle(this.original).finally(()=>{
                favorite.toggleClass('active', Boolean(Favorites.find(this.original)))

                this.listener.send('action-favorite', this.original)
            })
        })

        let locked = this.button(Lampa.Template.get('cub_iptv_icon_lock', {}, true), Lampa.Lang.translate( Locked.find(Locked.format('channel', this.original)) ? 'iptv_channel_unlock' : 'iptv_channel_lock' ), ()=>{
            let name = Lampa.Controller.enabled().name

            if(Lampa.Manifest.app_digital >= 204){
                if(Locked.find(Locked.format('channel', this.original))){
                    Lampa.ParentalControl.query(()=>{
                        Lampa.Controller.toggle(name)

                        Locked.remove(Locked.format('channel', this.original)).finally(()=>{
                            locked.toggleClass('active', Boolean(Locked.find(Locked.format('channel', this.original))))

                            this.listener.send('action-locked', this.original)
                        })
                    },()=>{
                        Lampa.Controller.toggle(name)
                    })
                }
                else{
                    Locked.add(Locked.format('channel', this.original)).finally(()=>{
                        locked.toggleClass('active', Boolean(Locked.find(Locked.format('channel', this.original))))

                        this.listener.send('action-locked', this.original)
                    })
                }
            }
            else{
                Lampa.Noty.show(Lampa.Lang.translate('iptv_need_update_app'))
            }
        })

        favorite.toggleClass('active', Boolean(Favorites.find(this.original)))
        locked.toggleClass('active', Boolean(Locked.find(Locked.format('channel', this.original))))

        this.html.append(info)
        this.html.append(favorite)
        this.html.append(locked)
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
                Navigator.move('up')
            },
            down: ()=>{
                Navigator.move('down')
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