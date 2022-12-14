import Controller from '../controller'
import Reguest from '../../utils/reguest'
import Line from '../items/line'
import Scroll from '../scroll'
import Activity from '../activity'
import Empty from '../empty'
import Arrays from '../../utils/arrays'
import Storage from '../../utils/storage'
import Lang from '../../utils/lang'
import Layer from '../../utils/layer'
import Platform from '../../utils/platform'

function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over: true,scroll_by_item:true,end_ratio: 1.5})
    let items   = []
    let html    = document.createElement('div')
    let active  = 0
    let light   = Platform.screen('light')
    
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

        html.append(empty.render(button))

        this.start = empty.start

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.loadNext = function(){
        if(this.next && !this.next_wait && items.length){
            this.next_wait = true

            this.next((new_data)=>{
                this.next_wait = false

                new_data.forEach(this.append.bind(this))

                Layer.visible(items[active+1].render(true))
            },()=>{
                this.next_wait = false
            })
        } 
    }

    this.build = function(data){
        scroll.minus()

        html.appendChild(scroll.render(true))

        scroll.onWheel = (step)=>{
            if(step > 0) this.down()
            else if(active > 0) this.up()
        }
        
        scroll.onEnd = this.loadNext.bind(this)

        data.forEach(this.append.bind(this))

        Layer.update(html)

        Layer.visible(html)

        this.activity.loader(false)

        this.activity.toggle()

        this.show()
    }

    this.append = function(element){
        if(element.ready) return

        element.ready = true

        let item = new Line(element, {
            url: element.url,
            genres: object.genres,
            object: object,
            card_wide: element.wide,
            nomore: element.nomore,
            type: 'cards'
        })

        item.create()

        item.onDown  = this.down.bind(this)
        item.onUp    = this.up.bind(this)
        item.onBack  = this.back.bind(this)

        if(this.onMore) item.onMore = this.onMore.bind(this)

        
        if(!light){
            scroll.append(item.render(true))
        }
        /*
        else{
            item.wrap = $('<div></div>')

            scroll.append(item.wrap)
        }
        */
        
        items.push(item)
    }

    this.back = function(){
        Activity.backward()
    }

    this.detach = function(){
        if(light){
            items.forEach(item=>{
                let node = item.render(true)

                if(node.parentElement) node.parentElement.removeChild(node)
            })

            items.slice(active, active + 2).forEach(item=>{
                scroll.append(item.render(true))
            })

            if(active >= items.length - 2) this.loadNext()
        }
    }

    this.down = function(){
        active++

        active = Math.min(active, items.length - 1)

        Layer.visible(items[active].render(true))

        scroll.update(items[active].render(true))

        items[active].toggle()
    }

    this.up = function(){
        active--

        if(active < 0){
            active = 0

            this.detach()

            Controller.toggle('head')
        }
        else{
            this.detach()

            items[active].toggle()
        }

        scroll.update(items[active].render(true))
    }

    this.show = function(){
        if(items.length){
            this.detach()
        }
    }

    this.start = function(){
        Controller.add('content',{
            toggle: ()=>{
                if(this.activity.canRefresh()) return false

                if(items.length){
                    this.detach()

                    items[active].toggle()
                }
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
        network.clear()

        Arrays.destroy(items)

        scroll.destroy()

        html.remove()

        items = []
    }
}

export default component