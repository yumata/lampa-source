import Controller from '../interaction/controller'
import Reguest from '../utils/reguest'
import Card from '../interaction/card'
import Scroll from '../interaction/scroll'
import Api from '../interaction/api'
import Info from '../interaction/info'
import Background from '../interaction/background'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'
import Empty from '../interaction/empty'
import Utils from '../utils/math'
import Select from '../interaction/select'
import Favorite from '../utils/favorite'
import Noty from '../interaction/noty'
import Storage from '../utils/storage'
import Template from '../interaction/template'
import Modal from '../interaction/modal'
import Account from '../utils/account'
import Lang from '../utils/lang'

function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over: true,step: 250, end_ratio:2})
    let items   = []
    let html    = $('<div></div>')
    let body    = $('<div class="category-full"></div>')
    let total_pages = 0
    let info
    let last
    let waitload
    let timer_offer
    let need_update = false
    let time_update = Date.now()

    let update = (e)=>{
        if(e.name == 'account'){
            need_update = true
            
            this.again()
        }
    }

    this.again = function(){
        if(Lampa.Activity.active().activity == this.activity && need_update && time_update < Date.now() - 1000){
            time_update = Date.now()

            setTimeout(()=>{
                if(!$('body').hasClass('settings--open')){
                    object.page = 1

                    Activity.replace(object)
                }
            },0)
        }
    }
    
    this.create = function(){
        this.activity.loader(true)

        if(Account.working()){
            Account.network.timeout(5000)

            Account.update(this.display.bind(this))
        }
        else this.display()
        
        return this.render()
    }

    this.display = function(){
        Api.favorite(object,this.build.bind(this),this.empty.bind(this))

        Storage.listener.follow('change',update)    
        //Account.listener.follow('update_bookmarks',update)
    }

    this.offer = ()=>{
        if(!Account.working()){
            let shw = Storage.get('favotite_offer','false')
            if(!shw){
                timer_offer = setTimeout(()=>{
                    let tpl = Template.get('torrent_install',{})

                    Storage.set('favotite_offer','true')

                    tpl.find('.torrent-install__title').text(Lang.translate('fav_sync_title'))
                    tpl.find('.torrent-install__descr').html(Lang.translate('fav_sync_text'))
                    tpl.find('.torrent-install__label').remove()
                    tpl.find('.torrent-install__links').html('<div class="torrent-install__link"><div>'+Lang.translate('fav_sync_site')+'</div><div>www.cub.watch</div></div>')
                    tpl.find('.torrent-install__left img').attr('src','https://yumata.github.io/lampa/img/ili/bookmarks.png')

                    Modal.open({
                        title: '',
                        html: tpl,
                        size: 'large',
                        onBack: ()=>{
                            Modal.close()
                
                            Controller.toggle('content')
                        }
                    })
                },5000)
            }
        }
    }

    this.empty = ()=>{
        let empty = new Empty()

        html.append(empty.render())

        this.start = empty.start

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.next = function(){
        if(waitload) return

        if(object.page < 15 && object.page < total_pages){
            waitload = true

            object.page++

            Api.favorite(object,(result)=>{
                this.append(result, true)

                waitload = false
            },()=>{})
        }
    }

    this.append = function(data, append){
        data.results.forEach(element => {
            let card = new Card(element, {
                card_category: true
            })

            card.create()
            card.onFocus = (target, card_data)=>{
                last = target

                scroll.update(card.render(), true)
                
                Background.change(Utils.cardImgBackground(card_data))

                if(info){
                    info.update(card_data)

                    if(scroll.isEnd()) this.next()
                }
            }

            card.onEnter = (target, card_data)=>{
                Activity.push({
                    url: card_data.url,
                    component: 'full',
                    id: element.id,
                    method: card_data.name ? 'tv' : 'movie',
                    card: element,
                    source: card_data.source || 'tmdb'
                })
            }

            if(object.type == 'history'){
                card.onMenu = (target, card_data)=>{
                    let enabled = Controller.enabled().name

                    Select.show({
                        title: Lang.translate('title_action'),
                        items: [
                            {
                                title: Lang.translate('fav_remove_title'),
                                subtitle: Lang.translate('fav_remove_descr'),
                                one: true
                            },
                            {
                                title: Lang.translate('fav_clear_title'),
                                subtitle: Lang.translate('fav_clear_descr'),
                                all: true
                            },
                            {
                                title: Lang.translate('fav_clear_label_title'),
                                subtitle: Lang.translate('fav_clear_label_descr'),
                                label: true
                            },
                            {
                                title: Lang.translate('fav_clear_time_title'),
                                subtitle: Lang.translate('fav_clear_time_descr'),
                                timecode: true
                            },
                        ],
                        onBack: ()=>{
                            Controller.toggle(enabled)
                        },
                        onSelect: (a)=>{
                            if(a.all){
                                Favorite.clear('history')

                                this.clear()

                                html.empty()

                                this.empty()
                            }
                            else if(a.label){
                                Storage.set('online_view',[])
                                Storage.set('torrents_view',[])
                                
                                Noty.show(Lang.translate('fav_label_cleared'))
                            }
                            else if(a.timecode){
                                Storage.set('file_view',{})
                                
                                Noty.show(Lang.translate('fav_time_cleared'))
                            }
                            else{
                                Favorite.remove('history', card_data)

                                let index = items.indexOf(card)

                                if(index > 0) last = items[index - 1].render()[0]
                                else if(items[index + 1]) last = items[index + 1].render()[0]
                                
                                Arrays.remove(items, card)

                                card.destroy()

                                if(!items.length){
                                    this.clear()

                                    html.empty()

                                    this.empty()
                                }
                            } 

                            Controller.toggle(enabled)
                        }
                    })
                }
            }

            card.visible()

            body.append(card.render())

            if(append) Controller.collectionAppend(card.render())

            items.push(card)
        })
    }

    this.build = function(data){
        total_pages = data.total_pages

        if(Storage.field('light_version')){
            scroll.minus()

            html.append(scroll.render())
        }
        else{
            info = new Info()

            info.create()

            scroll.minus(info.render())

            html.append(info.render())
            html.append(scroll.render())
        }

        this.append(data)

        if(total_pages > data.page && !info) this.more()

        scroll.append(body)

        this.activity.loader(false)

        this.activity.toggle()

        this.offer()
    }

    this.more = function(){
        let more = $('<div class="category-full__more selector"><span>'+Lang.translate('show_more')+'</span></div>')

        more.on('hover:focus',(e)=>{
            Controller.collectionFocus(last || false,scroll.render())

            let next = Arrays.clone(object)

            delete next.activity

            next.page++

            Activity.push(next)
        })

        body.append(more)
    }

    this.start = function(){
        Controller.add('content',{
            toggle: ()=>{
                Controller.collectionSet(scroll.render())
                Controller.collectionFocus(last || false,scroll.render())

                this.again()
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            right: ()=>{
                Navigator.move('right')
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else Controller.toggle('head')
            },
            down: ()=>{
                if(Navigator.canmove('down')) Navigator.move('down')
            },
            back: ()=>{
                Activity.backward()
            }
        })

        Controller.toggle('content')
    }

    this.pause = function(){
        
    }

    this.stop = function(){
        
    }

    this.render = function(){
        return html
    }

    this.clear = function(){
        network.clear()

        Arrays.destroy(items)

        items = []

        if(scroll) scroll.destroy()

        if(info) info.destroy()

        scroll = null
        info   = null
    }

    this.destroy = function(){
        this.clear()

        html.remove()
        body.remove()

        clearTimeout(timer_offer)
        
        Storage.listener.remove('change',update)
        //Account.listener.remove('update_bookmarks',update)

        network = null
        items   = null
        html    = null
        body    = null
        info    = null
    }
}

export default component
