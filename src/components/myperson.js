import Controller from '../interaction/controller'
import Reguest from '../utils/reguest'
import Card from '../interaction/card'
import Scroll from '../interaction/scroll'
import Background from '../interaction/background'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'
import Empty from '../interaction/empty'
import Utils from '../utils/math'
import Storage from '../utils/storage'
import Lang from '../utils/lang'
import Layer from '../utils/layer'
import Account from '../utils/account'

/**
 * Компонент "Мои персоны"
 * @param {*} object 
 */
function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over:true,step:250,end_ratio:2})
    let items   = []
    let html    = document.createElement('div')
    let body    = document.createElement('div')
    let last
    let active = 0

    let follow = (event)=>{
        if(event.name == 'person_subscribes_id'){
            items.forEach(card=>{
                if(event.value.indexOf(card.data.id) == -1){
                    card.render(true).style.opacity = 0.5
                    card.onEnter = ()=>{}
                }
            })
        }
    }
    
    this.create = function(){
        this.activity.loader(true)

        Storage.listener.follow('change',follow)

        Account.persons(this.build.bind(this), this.empty.bind(this))
    }

    this.empty = function(){
        let empty = new Empty()

        html.appendChild(empty.render(true))

        this.start = empty.start

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.append = function(data, append){
        data.forEach(element => {
            let card = new Card(element.person, {
                card_category: true
            })
            
            card.create()
            card.onFocus = (target, card_data)=>{
                last = target

                active = items.indexOf(card)

                scroll.update(card.render(true))

                Background.change(Utils.cardImgBackgroundBlur(card_data))
            }
            
            card.onTouch = (target, card_data)=>{
                last = target

                active = items.indexOf(card)
            }

            card.onEnter = (target, card_data)=>{
                last = target
                
                Activity.push({
                    url: element.person.url,
                    title: Lang.translate('title_person'),
                    component: 'actor',
                    id: element.person_id,
                    source: object.source
                })
            }

            card.onMenu = ()=>{}

            body.appendChild(card.render(true))

            items.push(card)

            if(append) Controller.collectionAppend(card.render(true))
        })
    }

    this.limit = function(){
        let limit_view = 12
        let lilit_collection = 36

        let colection = items.slice(Math.max(0,active - limit_view), active + limit_view)

        items.forEach(item=>{
            if(colection.indexOf(item) == -1){
                item.render(true).classList.remove('layer--render')
            }
            else{
                item.render(true).classList.add('layer--render')
            }
        })

        Navigator.setCollection(items.slice(Math.max(0,active - lilit_collection), active + lilit_collection).map(c=>c.render(true)))
        Navigator.focused(last)

        Layer.visible(scroll.render(true))
    }

    this.build = function(data){
        if(data.length){
            body.classList.add('category-full')

            scroll.minus()
            scroll.onScroll = this.limit.bind(this)
            scroll.onWheel  = (step)=>{
                if(!Controller.own(this)) this.start()

                if(step > 0) Navigator.move('down')
                else Navigator.move('up')
            }

            this.append(data)

            scroll.append(body)
            
            html.appendChild(scroll.render(true))

            this.limit()

            this.activity.loader(false)

            this.activity.toggle()
        }
        else{
            this.empty()
        }
    }

    this.start = function(){
        Controller.add('content',{
            link: this,
            toggle: ()=>{
                if(this.activity.canRefresh()) return false

                Controller.collectionSet(scroll.render(true))
                Controller.collectionFocus(last || false,scroll.render(true))
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            right: ()=>{
                if(this.onRight){
                    if(Navigator.canmove('right')) Navigator.move('right')
                    else this.onRight()
                }
                else Navigator.move('right')
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

    this.refresh = function(){
        this.activity.needRefresh()
    }

    this.pause = function(){
        
    }

    this.stop = function(){
        
    }

    this.render = function(js){
        return js ? html : $(html)
    }

    this.destroy = function(){
        network.clear()

        Arrays.destroy(items)

        scroll.destroy()

        Storage.listener.remove('change', follow)

        html.remove()
        body.remove()

        items = []
    }
}

export default component