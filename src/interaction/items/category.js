import Controller from '../../interaction/controller'
import Reguest from '../../utils/reguest'
import Card from '../../interaction/card'
import Scroll from '../../interaction/scroll'
import Api from '../../interaction/api'
import Background from '../../interaction/background'
import Activity from '../../interaction/activity'
import Arrays from '../../utils/arrays'
import Empty from '../../interaction/empty'
import Utils from '../../utils/math'
import Storage from '../../utils/storage'
import Lang from '../../utils/lang'
import Layer from '../../utils/layer'

function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over:true,step:250,end_ratio:2})
    let items   = []
    let html    = document.createElement('div')
    let body    = document.createElement('div')
    let total_pages = 0
    let last
    let waitload
    let active = 0
    
    this.create = function(){}

    this.empty = function(){
        let button

        if(object.source == 'tmdb'){
            button = $('<div class="empty__footer"><div class="simple-button selector">'+Lang.translate('change_source_on_cub')+'</div></div>')

            button.find('.selector').on('hover:enter',()=>{
                Storage.set('source','cub')

                Activity.replace({source: 'cub'})
            })
        }

        let empty = new Empty()

        if(button) empty.append(button)

        html.appendChild(empty.render(true))

        this.start = empty.start

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.next = function(){
        if(waitload) return

        if(object.page < total_pages){
            waitload = true

            object.page++

            this.nextPageReuest(object,(result)=>{
                this.append(result, true)

                waitload = false

                this.limit()
            },()=>{})
        }
    }

    this.nextPageReuest = function(object, resolve, reject){
        Api.list(object,resolve.bind(this), reject.bind(this))
    }

    this.append = function(data, append){
        data.results.forEach(element => {
            let card = new Card(element, {
                card_category: true,
                object: object
            })
            
            card.create()
            card.onFocus = (target, card_data)=>{
                last = target

                active = items.indexOf(card)

                scroll.update(card.render(true))

                Background.change(Utils.cardImgBackground(card_data))
            }

            card.onEnter = (target, card_data)=>{
                if(typeof card_data.gender !== 'undefined'){
                    Activity.push({
                        url: element.url,
                        title: Lang.translate('title_person'),
                        component: 'actor',
                        id: element.id,
                        source: element.source
                    })
                }
                else{
                    Activity.push({
                        url: card_data.url,
                        component: 'full',
                        id: element.id,
                        method: card_data.name ? 'tv' : 'movie',
                        card: element,
                        source: object.source
                    })
                }
            }

            body.appendChild(card.render(true))

            items.push(card)

            if(this.cardRender) this.cardRender(object, element, card)

            if(append) Controller.collectionAppend(card.render(true))
        })
    }

    this.limit = function(){
        let colection = items.slice(Math.max(0,active - 12), active + 12)

        items.forEach(item=>{
            if(colection.indexOf(item) == -1){
                item.render(true).classList.remove('layer--render')
            }
            else{
                item.render(true).classList.add('layer--render')
            }
        })

        Navigator.setCollection(colection.map(c=>c.render(true)))
        Navigator.focused(last)

        Layer.visible(scroll.render(true))
    }

    this.build = function(data){
        if(data.results.length){
            total_pages = data.total_pages

            body.classList.add('category-full')

            scroll.minus()
            scroll.onEnd    = this.next.bind(this)
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
            html.append(scroll.render())
            
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

        html.remove()
        body.remove()

        items = []
    }
}

export default component