import Favorites from '../utils/favorites'
import Utils from '../utils/utils'
import Search from './search'

class Menu{
    constructor(listener){
        this.listener = listener

        this.html  = Lampa.Template.js('cub_iptv_menu')
        this.menu  = this.html.find('.iptv-menu__list')

        this.scroll = new Lampa.Scroll({mask:!window.iptv_mobile,over: true,horizontal:window.iptv_mobile})

        if(!window.iptv_mobile) this.scroll.minus()

        this.scroll.append(this.html)
    }

    favorites(channels){
        let favorites = Favorites.list()

        if(Lampa.Storage.get('iptv_favotite_save','url') == 'name'){
            favorites = favorites.filter(f=>{
                return channels.find(c=>c.name == f.name)
            })

            favorites.forEach(f=>{
                f.url = channels.find(c=>c.name == f.name).url
            })
        }

        return favorites
    }

    build(data){
        this.menu.empty()

        let search_item = {
            name: Lampa.Lang.translate('search'),
            count: 0,
            search: true
        }

        this.html.find('.iptv-menu__title').text(data.name || Lampa.Lang.translate('player_playlist'))
        this.html.find('.iptv-menu__search').on('hover:enter',()=>{
            Search.find(data.playlist.channels, search_item.update)
        })

        Lampa.Arrays.insert(data.playlist.menu,0,search_item)

        let favorites = this.favorites(data.playlist.channels)

        Lampa.Arrays.insert(data.playlist.menu,0,{
            name: Lampa.Lang.translate('settings_input_links'),
            count: favorites.length,
            favorites: true
        })

        let first
        let first_item

        if(window.iptv_mobile){
            let mobile_seacrh_button = Lampa.Template.js('iptv_menu_mobile_button_search')

            mobile_seacrh_button.on('hover:enter',()=>{
                Search.find(data.playlist.channels, search_item.update)
            })

            this.menu.append(mobile_seacrh_button)
        }

        data.playlist.menu.forEach((menu)=>{
            if(menu.count == 0 && !(menu.favorites || menu.search)) return

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
            else if(menu.search){
                li.addClass('search--menu-item')

                menu.update = (result)=>{
                    menu.find  = result.channels
                    menu.count = result.channels.length

                    li.find('span').text(result.channels.length)

                    if(menu.count) Lampa.Utils.trigger(li,'hover:enter')
                    else{
                        Lampa.Noty.show(Lampa.Lang.translate('iptv_search_no_result') + ' ('+result.query+')')

                        if(first_item) Lampa.Utils.trigger(first_item,'hover:enter')
                    }
                }
            }
            else if(!first_item){
                first_item = li
            }
            
            li.on('hover:enter',()=>{
                if(menu.count == 0) return
                
                if(menu.favorites){
                    this.listener.send('icons-load', {menu, icons: favorites})
                }
                else if(menu.search){
                    this.listener.send('icons-load', {menu, icons: menu.find})
                }
                else{
                    this.listener.send('icons-load', {menu, icons: menu.name ? data.playlist.channels.filter(a=>a.group == menu.name) : data.playlist.channels})
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
                Lampa.Controller.collectionSet(this.html)
                Lampa.Controller.collectionFocus(this.last,this.html)
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