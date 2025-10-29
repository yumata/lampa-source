import Controller from '../../../core/controller'
import Line from './line'
import Scroll from '../../scroll'
import Activity from '../../activity/activity'
import Empty from '../../empty/empty'
import Arrays from '../../../utils/arrays'
import Storage from '../../../core/storage/storage'
import Lang from '../../../core/lang'
import Layer from '../../../core/layer'

function component(object){
    let scroll  = new Scroll({mask:true,over: true,scroll_by_item:true,end_ratio: 1.5})
    let items   = []
    let html    = document.createElement('div')
    let active  = 0

    console.warn('Component InteractionMain is deprecated.')
    
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

        empty.addInfoButton()

        html.appendChild(empty.render(true))

        this.start = empty.start.bind(empty)

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.loadNext = function(){
        if(this.next && !this.next_wait && items.length){
            this.next_wait = true

            this.next((new_data)=>{
                this.next_wait = false

                if(!items.length) return

                new_data.forEach(this.append.bind(this))

                Layer.visible(items[active+1].render(true))
            },()=>{
                this.next_wait = false
            })
        } 
    }

    this.build = function(data){
        scroll.minus()

        scroll.onWheel = (step)=>{
            if(!Controller.own(this)) this.start()

            if(step > 0) this.down()
            else if(active > 0) this.up()
        }
        
        scroll.onEnd = this.loadNext.bind(this)

        if(this.onLinesBuild) this.onLinesBuild(data)

        data.forEach(this.append.bind(this))

        html.appendChild(scroll.render(true))

        Layer.update(html)

        this.activity.loader(false)

        this.activity.toggle()

        Layer.visible(html)
    }

    this.append = function(element){
        if(element.ready) return

        element.ready = true

        let item = new Line(element, {
            url: element.url,
            genres: object.genres,
            object: object,
            card_wide: element.wide,
            card_small: element.small,
            card_broad: element.broad,
            card_collection: element.collection,
            card_category: element.category,
            card_events: element.card_events,
            cardClass: element.cardClass,
            nomore: element.nomore,
            type: element.line_type || 'cards'
        })

        item.create()

        this.push(item, element)
    }

    this.back = function(){
        Activity.backward()
    }

    this.push = function(item, element){
        item.onDown  = this.down.bind(this)
        item.onUp    = this.up.bind(this)
        item.onBack  = this.back.bind(this)

        if(this.onMore) item.onMore = this.onMore.bind(this)

        items.push(item)

        if(this.onAppend) this.onAppend(item, element)

        scroll.append(item.render(true))
    }

    this.down = function(){
        active++

        active = Math.min(active, items.length - 1)

        scroll.update(items[active].render(true))

        items[active].toggle()
    }

    this.up = function(){
        active--

        if(active < 0){
            active = 0

            Controller.toggle('head')
        }
        else{
            items[active].toggle()

            scroll.update(items[active].render(true))
        }
    }

    this.start = function(){
        Controller.add('content',{
            link: this,
            toggle: ()=>{
                if(this.activity.canRefresh()) return false

                if(items.length) items[active].toggle()
            },
            update: ()=>{

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
            back: this.back
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
        Arrays.destroy(items)

        scroll.destroy()

        html.remove()

        items = []

        if(this.onDestroy) this.onDestroy()
    }
}

export default component