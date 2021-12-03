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

function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over: true,step: 250})
    let items   = []
    let html    = $('<div></div>')
    let body    = $('<div class="category-full"></div>')
    let total_pages = 0
    let info
    let last
    let waitload
    
    
    this.create = function(){
        this.activity.loader(true)

        Api.favorite(object,this.build.bind(this),this.empty.bind(this))

        return this.render()
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
                this.append(result)

                waitload = false

                Controller.enable('content')
            },()=>{})
        }
    }

    this.append = function(data){
        data.results.forEach(element => {
            let card = new Card(element, {
                card_category: true
            })

            card.create()
            card.onFocus = (target, card_data)=>{
                last = target

                scroll.update(card.render(), true)
                
                Background.change(Utils.cardImgBackground(card_data))

                info.update(card_data)

                let maxrow = Math.ceil(items.length / 7) - 1

                if(Math.ceil(items.indexOf(card) / 7) >= maxrow) this.next()
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
                        title: 'Действие',
                        items: [
                            {
                                title: 'Удалить из истории',
                                subtitle: 'Удалить выделенную карточку',
                                one: true
                            },
                            {
                                title: 'Очистить историю',
                                subtitle: 'Удалить все карточки из истории',
                                all: true
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
                            else{
                                Favorite.clear('history', card_data)

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

            items.push(card)
        })
    }

    this.build = function(data){
        total_pages = data.total_pages

        info = new Info()

        info.create()

        scroll.render().addClass('layer--wheight').data('mheight', info.render())

        html.append(info.render())
        html.append(scroll.render())

        this.append(data)

        scroll.append(body)

        this.activity.loader(false)

        this.activity.toggle()
    }


    this.start = function(){
        Controller.add('content',{
            toggle: ()=>{
                Controller.collectionSet(scroll.render())
                Controller.collectionFocus(last || false,scroll.render())
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

        network = null
        items   = null
        html    = null
        body    = null
        info    = null
    }
}

export default component