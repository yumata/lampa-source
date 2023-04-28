import Api from '../utils/api'
import DB from '../utils/db'
import Item from './item'

class Playlist{
    constructor(listener){
        this.listener = listener

        this.html   = Lampa.Template.js('cub_iptv_list')
        this.scroll = new Lampa.Scroll({mask:true,over: true})

        this.html.find('.iptv-list__title').text(Lampa.Lang.translate('iptv_select_playlist'))
        
        this.html.find('.iptv-list__items').append(this.scroll.render(true))
    }

    list(playlist){
        this.scroll.clear()
        this.scroll.reset()

        this.html.find('.iptv-list__text').html(Lampa.Lang.translate('iptv_select_playlist_text'))

        playlist.list.reverse().forEach((data)=>{
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

            this.scroll.append(elem)
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
            let active = result[1]

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
        }).catch((e)=>{
            this.empty()
        })
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