import Api from '../utils/api'
import DB from '../utils/db'
import Item from './item'
import Pilot from '../utils/pilot'

class Playlist{
    constructor(listener){
        this.listener = listener

        this.html   = Lampa.Template.js('cub_iptv_list')
        this.scroll = new Lampa.Scroll({mask:true,over: true})

        this.html.find('.iptv-list__title').text(Lampa.Lang.translate('iptv_select_playlist'))
        
        this.html.find('.iptv-list__items').append(this.scroll.render(true))
    }

    item(data){
        let item = new Item(data)
            item.listener = this.listener

        let elem = item.render()

        elem.on('hover:focus',()=>{
            this.last = elem

            this.scroll.update(this.last)
        }).on('hover:hover hover:touch',()=>{
            this.last = elem

            Navigator.focused(elem)
        })

        return item
    }

    list(playlist){
        this.scroll.clear()
        this.scroll.reset()

        this.html.find('.iptv-list__text').html(Lampa.Lang.translate('iptv_select_playlist_text'))

        let add = Lampa.Template.js('cub_iptv_list_add_custom')

        add.find('.iptv-playlist-item__title').text(Lampa.Lang.translate('iptv_playlist_add_new'))

        add.on('hover:enter',()=>{
            Lampa.Input.edit({
                title: Lampa.Lang.translate('iptv_playlist_add_set_url'),
                free: true,
                nosave: true,
                value: ''
            },(value)=>{
                if(value){
                    let data = {
                        id: Lampa.Utils.uid(),
                        custom: true,
                        url: value,
                        name: ''
                    }

                    Lampa.Storage.add('iptv_playlist_custom',data)

                    let item = this.item(data)

                    add.parentNode.insertBefore(item.render(), add.nextSibling)
                }

                Lampa.Controller.toggle('content')
            })
        })

        add.on('hover:focus',()=>{
            this.last = add

            this.scroll.update(this.last)
        })

        this.scroll.append(add)

        playlist.list.reverse().forEach((data)=>{
            let item = this.item(data)

            this.scroll.append(item.render())
        })

        this.listener.send('display',this)
    }

    main(){
        Api.list().then(this.list.bind(this)).catch(this.empty.bind(this))
    }

    load(){
        Promise.all([
            Api.list(),
            DB.getDataAnyCase('playlist','active')
        ]).then((result)=>{
            
            let playlist = result[0]
            let active = result[1] || Pilot.notebook('playlist')

            if(playlist){
                if(active){
                    let find = playlist.list.find(l=>l.id == active)

                    if(find){
                        this.listener.send('channels-load',find)
                    }
                    else this.list(playlist)
                }
                else this.list(playlist)
            }
            else this.empty()
        }).catch(this.empty.bind(this))
    }

    empty(){
        this.scroll.clear()
        this.scroll.reset()

        this.html.find('.iptv-list__text').html(Lampa.Lang.translate('iptv_playlist_empty'))

        let empty = Lampa.Template.js('cub_iptv_list_empty')
            empty.find('.iptv-list-empty__text').html(Lampa.Lang.translate('empty_title'))

        this.scroll.append(empty)

        this.listener.send('display',this)
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
            down: Navigator.move.bind(Navigator,'down'),
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else Lampa.Controller.toggle('head')
            },
            back: ()=>{
                Lampa.Activity.backward()
            }
        })

        Lampa.Controller.toggle('content')
    }

    render(){
        return this.html
    }

    destroy(){
        this.scroll.destroy()

        this.html.remove()
    }
}

export default Playlist