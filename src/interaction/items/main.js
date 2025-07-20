import Controller from '../controller'
import Line from '../items/line'
import Scroll from '../scroll'
import Activity from '../activity'
import Empty from '../empty'
import Arrays from '../../utils/arrays'
import Storage from '../../utils/storage'
import Lang from '../../utils/lang'
import Layer from '../../utils/layer'

class Main{
    constructor(object){
        this.object  = object || {}
        this.scroll  = new Scroll({mask:true,over: true,scroll_by_item:true,end_ratio: 1.5})
        this.items   = []
        this.html    = document.createElement('div')
        this.active  = 0
    }
    
    create(){}

    empty(){
        let button

        if(this.object.source == 'tmdb'){
            button = $('<div class="empty__footer"><div class="simple-button selector">'+Lang.translate('change_source_on_cub')+'</div></div>')

            button.find('.selector').on('hover:enter',()=>{
                Storage.set('source','cub')

                Activity.replace({source: 'cub'})
            })
        }

        let empty = new Empty()

        if(button) empty.append(button)

        empty.addInfoButton()

        this.html.appendChild(empty.render(true))

        this.start = empty.start

        this.activity.loader(false)

        this.activity.toggle()
    }

    loadNext(){
        if(this.next && !this.next_wait && this.items.length){
            this.next_wait = true

            this.next((new_data)=>{
                this.next_wait = false

                if(!this.items.length) return

                new_data.forEach(this.append.bind(this))

                Layer.visible(this.items[this.active+1].render(true))
            },()=>{
                this.next_wait = false
            })
        } 
    }

    build(data){
        this.scroll.minus()

        this.scroll.onWheel = (step)=>{
            if(!Controller.own(this)) this.start()

            if(step > 0) this.down()
            else if(this.active > 0) this.up()
        }
        
        this.scroll.onEnd = this.loadNext.bind(this)

        if(this.onLinesBuild) this.onLinesBuild(data)

        data.forEach(this.append.bind(this))

        this.html.appendChild(this.scroll.render(true))

        Layer.update(this.html)

        this.activity.loader(false)

        this.activity.toggle()

        Layer.visible(this.html)
    }

    append(element){
        if(element.ready) return

        element.ready = true

        let item = new Line(element, {
            url: element.url,
            genres: this.object.genres,
            object: this.object,
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

    back(){
        Activity.backward()
    }

    push(item, element){
        item.onDown  = this.down.bind(this)
        item.onUp    = this.up.bind(this)
        item.onBack  = this.back.bind(this)

        if(this.onMore) item.onMore = this.onMore.bind(this)

        this.items.push(item)

        if(this.onAppend) this.onAppend(item, element)

        this.scroll.append(item.render(true))
    }

    down(){
        this.active++

        this.active = Math.min(this.active, this.items.length - 1)

        this.scroll.update(this.items[this.active].render(true))

        this.items[this.active].toggle()
    }

    up(){
        this.active--

        if(this.active < 0){
            this.active = 0

            Controller.toggle('head')
        }
        else{
            this.items[this.active].toggle()

            this.scroll.update(this.items[this.active].render(true))
        }
    }

    start(){
        Controller.add('content',{
            link: this,
            toggle: ()=>{
                if(this.activity.canRefresh()) return false

                if(this.items.length) this.items[this.active].toggle()
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

    refresh(){
        this.activity.needRefresh()
    }

    pause(){}

    stop(){}

    render(js){
        return js ? this.html : $(this.html)
    }

    destroy(){
        Arrays.destroy(this.items)

        this.scroll.destroy()

        this.html.remove()

        this.items = []

        if(this.onDestroy) this.onDestroy()
    }
}

export default Main