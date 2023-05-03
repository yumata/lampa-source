import Favorites from '../utils/favorites'
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

        this.listener.follow('icons-load',icons=>{
            this.icons = icons

            this.html.empty()

            this.scroll.reset()

            this.position = 0

            this.last = false

            this.next()
        })
    }

    active(item){
        let active = this.html.find('.active')

        if(active) active.removeClass('active')

        item.addClass('active')
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

            let position = start + index

            chn.text((position + 1).pad(3))

            item.addClass('iptv-channel selector layer--visible layer--render')
            body.addClass('iptv-channel__body')
            img.addClass('iptv-channel__ico')
            chn.addClass('iptv-channel__chn')

            body.append(img)
            item.append(body)
            item.append(chn)

            item.toggleClass('favorite', Boolean(Favorites.find(element)))

            item.on('visible',()=>{
                img.onerror = ()=>{
                    let simb = document.createElement('div')
                        simb.addClass('iptv-channel__simb')
                        simb.text(element.name.replace(/[^a-z|а-я]/gi,'').toUpperCase()[0])

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
                        }
                    ],
                    onSelect: (a)=>{
                        Favorites.toggle(element).finally(()=>{
                            item.toggleClass('favorite', Boolean(Favorites.find(element)))

                            this.listener.send('update-favorites')
                        })

                        this.toggle()
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