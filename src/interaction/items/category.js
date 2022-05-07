import Controller from '../../interaction/controller'
import Reguest from '../../utils/reguest'
import Card from '../../interaction/card'
import Scroll from '../../interaction/scroll'
import Api from '../../interaction/api'
import Info from '../../interaction/info'
import Background from '../../interaction/background'
import Activity from '../../interaction/activity'
import Arrays from '../../utils/arrays'
import Empty from '../../interaction/empty'
import Utils from '../../utils/math'
import Storage from '../../utils/storage'

function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over:true,step:250})
    let items   = []
    let html    = $('<div></div>')
    let body    = $('<div class="category-full"></div>')
    let total_pages = 0
    let info
    let last
    let waitload
    
    
    this.create = function(){}

    this.empty = function(){
        let empty = new Empty()

        scroll.append(empty.render())

        this.start = empty.start

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.next = function(){
        if(waitload) return

        if(object.page < 15 && object.page < total_pages){
            waitload = true

            object.page++

            Api.list(object,(result)=>{
                this.append(result)

                waitload = false

                Controller.enable('content')
            },()=>{})
        }
    }

    this.append = function(data){
        data.results.forEach(element => {
            let card = new Card(element, {
                card_category: true,
                object: object
            })
            
            card.create()
            card.onFocus = (target, card_data)=>{
                last = target

                scroll.update(card.render(), true)

                Background.change(Utils.cardImgBackground(card_data))

                if(info){
                    info.update(card_data)

                    let maxrow = Math.ceil(items.length / 7) - 1

                    if(Math.ceil(items.indexOf(card) / 7) >= maxrow) this.next()
                }
            }

            card.onEnter = (target, card_data)=>{
                Activity.push({
                    url: card_data.url,
                    component: 'full',
                    id: element.id,
                    method: card_data.name ? 'tv' : 'movie',
                    card: element,
                    source: object.source
                })
            }

            card.visible()

            body.append(card.render())

            items.push(card)
        })
    }

    this.build = function(data){
        if(data.results.length){
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
        }
        else{
            html.append(scroll.render())
            
            this.empty()
        }
    }

    this.more = function(){
        let more = $('<div class="category-full__more selector"><span>Показать еще</span></div>')

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

    this.destroy = function(){
        network.clear()

        Arrays.destroy(items)

        scroll.destroy()
        
        if(info) info.destroy()

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