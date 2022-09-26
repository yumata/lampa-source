import Controller from '../controller'
import Reguest from '../../utils/reguest'
import Line from '../items/line'
import Scroll from '../scroll'
import Info from '../info'
import Activity from '../activity'
import Empty from '../empty'
import Arrays from '../../utils/arrays'
import Storage from '../../utils/storage'

function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over: true,scroll_by_item:true})
    let items   = []
    let html    = $('<div></div>')
    let active  = 0
    let info
    let lezydata
    let viewall = Storage.field('card_views_type') == 'view' || Storage.field('navigation_type') == 'mouse'
    
    this.create = function(){}

    this.empty = function(){
        let empty = new Empty()

        html.append(empty.render())

        this.start = empty.start

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.build = function(data){
        lezydata = data

        if(Storage.field('light_version') && window.innerWidth >= 767){
            scroll.minus()

            html.append(scroll.render())

            scroll.onWheel = (step)=>{
                if(step > 0) this.down()
                else this.up()
            }
        }
        else{
            info = new Info(object)

            info.create()

            scroll.minus(info.render())

            html.append(info.render())
            html.append(scroll.render())
        }

        data.slice(0,viewall ? data.length : 2).forEach(this.append.bind(this))

        this.activity.loader(false)

        this.activity.toggle()

        this.show()
    }

    this.append = function(element){
        if(element.ready) return

        element.ready = true

        let item = new Line(element, {
            url: element.url,
            card_small: true,
            genres: object.genres,
            object: object,
            card_wide: element.wide,
            nomore: element.nomore
        })

        item.create()

        item.onDown  = this.down.bind(this)
        item.onUp    = this.up.bind(this)
        item.onBack  = this.back.bind(this)

        if(this.onMore) item.onMore = this.onMore.bind(this)

        if(info){
            item.onFocus     = info.update
            item.onFocusMore = info.empty.bind(info)

            scroll.append(item.render())
        }
        else{
            item.wrap = $('<div></div>')

            scroll.append(item.wrap)
        }
        
        items.push(item)
    }

    this.back = function(){
        Activity.backward()
    }

    this.detach = function(){
        if(!info){
            items.forEach(item=>{
                item.render().detach()
            })

            items.slice(active, active + 2).forEach(item=>{
                item.wrap.append(item.render())
            })
        }
    }

    this.down = function(){
        active++

        active = Math.min(active, items.length - 1)

        if(!viewall) lezydata.slice(0,active + 2).forEach(this.append.bind(this))

        this.detach()

        items[active].toggle()

        scroll.update(items[active].render())
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

        scroll.update(items[active].render())
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
        this.activity.loader(true)
        
        this.activity.need_refresh = true
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

        items = null
        network = null
        lezydata = null
    }
}

export default component