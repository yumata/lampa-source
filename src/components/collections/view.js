import Controller from '../../interaction/controller'
import Reguest from '../../utils/reguest'
import Card from '../../interaction/card'
import Scroll from '../../interaction/scroll'
import Background from '../../interaction/background'
import Activity from '../../interaction/activity'
import Arrays from '../../utils/arrays'
import Empty from '../../interaction/empty'
import Utils from '../../utils/math'
import Api from '../../interaction/api'
import Info from '../../interaction/info'

function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over:true})
    let items   = []
    let html    = $('<div></div>')
    let body    = $('<div class="category-full"></div>')
    let last
    let info
    let collections = []
    let waitload
    
    
    this.create = function(){
        this.activity.loader(true)

        Api.collections(object,this.build.bind(this),()=>{
            let empty = new Empty()

            html.append(empty.render())

            this.start = empty.start

            this.activity.loader(false)

            this.activity.toggle()
        })

        return this.render()
    }

    this.next = function(){
        if(waitload) return

        if(object.page < 15){
            waitload = true

            object.page++

            Api.collections(object,(result)=>{
                this.append(result)

                if(result.length) waitload = false

                Controller.enable('content')
            },()=>{})
        }
    }

    this.append = function(data){
        data.forEach(element => {

            let card = new Card(element, {
                card_category: true,
                object: object
            })

            card.create()
            card.onFocus = (target, card_data)=>{
                last = target

                scroll.update(card.render(), true)

                info.update(card_data)

                Background.change(Utils.cardImgBackground(card_data))

                let maxrow = Math.ceil(items.length / 7) - 1

                if(Math.ceil(items.indexOf(card) / 7) >= maxrow && items.length > 19) this.next()
            }

            card.onEnter = (target, card_data)=>{
                Activity.push({
                    url: card_data.url,
                    component: 'full',
                    id: card_data.id,
                    source: object.source,
                    card: element
                })
            }

            card.visible()

            body.append(card.render())

            items.push(card)
        })
    }

    this.build = function(data){
        collections = data

        info = new Info()

        info.create()

        scroll.minus(info.render())

        html.append(info.render())
        html.append(scroll.render())

        this.append(collections)

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

    this.destroy = function(){
        network.clear()

        Arrays.destroy(items)

        scroll.destroy()

        html.remove()
        body.remove()

        if(info) info.destroy()

        network = null
        items   = null
        html    = null
        body    = null
        info    = null
    }
}

export default component