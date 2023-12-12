import Favorites from '../utils/favorites'
import Locked from '../utils/locked'
import Utils from '../utils/utils'

class Icons{
    constructor(listener){
        this.listener = listener
        this.position = 0
        this.scroll   = new Lampa.Scroll({mask:!window.iptv_mobile,over: true,end_ratio:2,horizontal:window.iptv_mobile})
        this.html     = document.createElement('div')

        this.html.addClass('iptv-channels')

        this.scroll.append(this.html)
        
        if(!window.iptv_mobile) this.scroll.minus()

        this.scroll.onEnd = ()=>{
            this.position++

            this.next()
        }

        this.listener.follow('icons-load',(data)=>{
            this.icons = data.icons

            if(data.menu.favorites){
                this.icons.sort((a,b)=>{
                    let ta = a.added || 0
                    let tb = b.added || 0
    
                    return ta < tb ? -1 : ta > tb ? 1 : 0
                })

                this.sort()
            }

            this.icons_clone = Lampa.Arrays.clone(this.icons)

            this.html.empty()

            this.scroll.reset()

            this.position = 0

            this.last = false

            this.next()
        })
    }

    sort(){
        let sort_type = Lampa.Storage.field('iptv_favotite_sort')

        if(Lampa.Account.hasPremium() && sort_type !== 'add'){
            this.icons.sort((a,b)=>{
                if(sort_type == 'name'){
                    return a.name < b.name ? -1 : a.name > b.name ? 1 : 0
                }
                else if(sort_type == 'view'){
                    let va = a.view || 0
                    let vb = b.view || 0

                    return va < vb ? 1 : va > vb ? -1 : 0
                }
            })
        }
    }

    active(item){
        let active = this.html.find('.active')

        if(active) active.removeClass('active')

        item.addClass('active')
    }

    icon(item, element){
        let icons = item.find('.iptv-channel__icons')
            icons.empty()

        if(Favorites.find(element)) icons.append(Lampa.Template.js('cub_iptv_icon_fav'))
        if(Locked.find(Locked.format('channel', element))) icons.append(Lampa.Template.js('cub_iptv_icon_lock'))
    }

    next(){
        let views = 10
        let start = this.position * views

        this.icons.slice(start, start + views).forEach((element, index) => {
            delete element.target

            let item = document.createElement('div')
            let body = document.createElement('div')
            let img  = document.createElement('img')
            let chn  = document.createElement('div')
            let icn  = document.createElement('div')

            let position = start + index

            chn.text((position + 1).pad(3))

            item.addClass('iptv-channel selector layer--visible layer--render')
            body.addClass('iptv-channel__body')
            img.addClass('iptv-channel__ico')
            chn.addClass('iptv-channel__chn')
            icn.addClass('iptv-channel__icons')

            body.append(img)
            item.append(body)
            item.append(chn)
            item.append(icn)

            this.icon(item, element)

            this.listener.follow('update-channel-icon',(channel)=>{
                if(channel.name == element.name) this.icon(item, element)
            })

            item.on('visible',()=>{
                img.onerror = ()=>{
                    let simb = document.createElement('div')
                        simb.addClass('iptv-channel__simb')
                        simb.text(element.name.length <= 3 ? element.name.toUpperCase() : element.name.replace(/[^a-z|а-я|0-9]/gi,'').toUpperCase()[0])

                    let text = document.createElement('div')
                        text.addClass('iptv-channel__name')
                        text.text(Utils.clear(element.name))

                    body.append(simb)
                    body.append(text)
                }
    
                img.onload = function(){
                    item.addClass('loaded')

                    if(element.logo.indexOf('epg.it999') == -1){
                        item.addClass('small--icon')
                    }
                }

                if(element.logo) img.src = element.logo
                else img.onerror()
            })

            item.on('hover:focus',()=>{
                this.active(item)

                this.scroll.update(item)

                if(this.last !== item) this.listener.send('details-load',element)

                this.last = item
            }).on('hover:hover hover:touch',()=>{
                Navigator.focused(item)

                this.active(item)

                if(this.last !== item) this.listener.send('details-load',element)

                this.last = item
            }).on('hover:long',()=>{
                Lampa.Select.show({
                    title: Lampa.Lang.translate('title_action'),
                    items: [
                        {
                            title: Lampa.Lang.translate(Favorites.find(element) ? 'iptv_remove_fav' : 'iptv_add_fav'),
                            type: 'favorite'
                        },
                        {
                            title: Lampa.Lang.translate(Locked.find(Locked.format('channel', element)) ? 'iptv_channel_unlock' : 'iptv_channel_lock' ),
                            type: 'locked'
                        }
                    ],
                    onSelect: (a)=>{
                        this.toggle()

                        if(a.type == 'favorite'){
                            Favorites.toggle(element).finally(()=>{
                                this.icon(item, element)

                                this.listener.send('update-favorites')
                            })
                        }
                        else if(a.type == 'locked'){
                            if(Lampa.Manifest.app_digital >= 204){
                                if(Locked.find(Locked.format('channel', element))){
                                    Lampa.ParentalControl.query(()=>{
                                        this.toggle()

                                        Locked.remove(Locked.format('channel', element)).finally(()=>{
                                            this.icon(item, element)
                                        })
                                    },this.toggle.bind(this))
                                }
                                else{
                                    Locked.add(Locked.format('channel', element)).finally(()=>{
                                        this.icon(item, element)
                                    })
                                }
                            }
                            else{
                                Lampa.Noty.show(Lampa.Lang.translate('iptv_need_update_app'))
                            }
                        }
                    },
                    onBack: this.toggle.bind(this)
                })
            }).on('hover:enter',()=>{
                this.listener.send('play',{
                    position: position,
                    total: this.icons.length
                })
            })

            this.html.append(item)

            if(Lampa.Controller.own(this)) Lampa.Controller.collectionAppend(item)
        })

        setTimeout(()=>{
            Lampa.Layer.visible(this.html)
        },300)
    }

    toggle(){
        Lampa.Controller.add('content',{
            link: this,
            toggle: ()=>{
                if(this.html.find('.selector')){
                    Lampa.Controller.collectionSet(this.html)
                    Lampa.Controller.collectionFocus(this.last,this.html)
                }
                else this.listener.send('toggle','menu')
            },
            left: ()=>{
                this.listener.send('toggle','menu')
            },
            right: ()=>{
                this.listener.send('toggle','details')
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

export default Icons