import Favorites from '../utils/favorites'
import Utils from '../utils/utils'

class Menu{
    constructor(listener){
        this.listener = listener

        this.html  = Lampa.Template.js('cub_iptv_menu')
        this.menu  = this.html.find('.iptv-menu__list')

        this.scroll = new Lampa.Scroll({mask:!window.iptv_mobile,over: true,horizontal:window.iptv_mobile})

        if(!window.iptv_mobile) this.scroll.minus()

        this.scroll.append(this.html)
    }

    build(data){
        this.menu.empty()

        this.html.find('.iptv-menu__title').text(data.name || Lampa.Lang.translate('player_playlist'))

        let favorites = Favorites.list()

        Lampa.Arrays.insert(data.playlist.menu,0,{
            name: Lampa.Lang.translate('settings_input_links'),
            count: favorites.length,
            favorites: true
        })

        let first

        data.playlist.menu.forEach((menu)=>{
            if(menu.count == 0 && !menu.favorites) return

            let li = document.createElement('div')
            let co = document.createElement('span')
                
            li.addClass('iptv-menu__list-item selector')
            li.text(Utils.clearMenuName(menu.name || Lampa.Lang.translate('iptv_all_channels')))
            co.text(menu.count)
            
            li.append(co)

            if(menu.favorites){
                li.addClass('favorites--menu-item')

                this.listener.follow('update-favorites',()=>{
                    favorites = Favorites.list()

                    menu.count = favorites.length

                    li.find('span').text(menu.count)
                })
            }
            
            li.on('hover:enter',()=>{
                if(menu.count == 0) return
                
                if(menu.favorites){
                    this.listener.send('icons-load', favorites)
                }
                else{
                    this.listener.send('icons-load', menu.name ? data.playlist.channels.filter(a=>a.group == menu.name) : data.playlist.channels)
                }

                let active = this.menu.find('.active')

                if(active) active.removeClass('active')

                li.addClass('active')

                this.last = li

                this.listener.send('toggle','icons')
            })

            li.on('hover:focus',()=>{
                this.scroll.update(li,true)

                this.last = li
            })

            if(!first && menu.count !== 0) first = li

            this.menu.append(li)
        })

        if(first) Lampa.Utils.trigger(first, 'hover:enter')
    }

    toggle(){
        Lampa.Controller.add('content',{
            toggle: ()=>{
                Lampa.Controller.collectionSet(this.render())
                Lampa.Controller.collectionFocus(this.last,this.render())
            },
            left: ()=>{
                Lampa.Controller.toggle('menu')
            },
            right: ()=>{
                this.listener.send('toggle','icons')
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else Lampa.Controller.toggle('head')
            },
            down: ()=>{
                if(Navigator.canmove('down')) Navigator.move('down')
            },
            back: ()=>{
                this.listener.send('back')
            }
        })

        Lampa.Controller.toggle('content')
    }

    render(){
        return this.scroll.render(true)
    }

    destroy(){
        this.scroll.destroy()

        this.html.remove()
    }
}

export default Menu