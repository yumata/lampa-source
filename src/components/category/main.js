import Controller from '../../interaction/controller'
import Reguest from '../../utils/reguest'
import Line from '../../interaction/items/line'
import Scroll from '../../interaction/scroll'
import Api from '../../interaction/api'
import Info from '../../interaction/info'
import Activity from '../../interaction/activity'
import Empty from '../../interaction/empty'
import Arrays from '../../utils/arrays'
import Storage from '../../utils/storage'

function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over:true,scroll_by_item:true})
    let items   = []
    let html    = $('<div></div>')
    let viewall = Storage.field('card_views_type') == 'view' || Storage.get('navigation_type') == 'mouse'
    let active  = 0
    let info
    let lezydata
    
    this.create = function(){
        this.activity.loader(true)

        Api.category(object,this.build.bind(this),()=>{
            let empty = new Empty()

            html.append(empty.render())

            this.start = empty.start

            this.activity.loader(false)

            this.activity.toggle()
        })

        return this.render()
    }

    this.build = function(data){
        lezydata = data

        info = new Info()

        info.create()

        scroll.render().addClass('layer--wheight').data('mheight', info.render())

        html.append(info.render())
        html.append(scroll.render())

        data.slice(0,viewall ? data.length : 2).forEach(this.append.bind(this))

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.append = function(element){
        if(element.ready) return

        element.ready = true

        let item = new Line(element, {
            url: element.url,
            card_small: true,
            genres: object.genres,
            object: object
        })

        item.create()

        item.onDown  = this.down.bind(this)
        item.onUp    = this.up
        item.onFocus = info.update
        item.onBack  = this.back

        scroll.append(item.render())

        items.push(item)
    }

    this.back = function(){
        Activity.backward()
    }

    this.down = function(){
        active++

        active = Math.min(active, items.length - 1)

        lezydata.slice(0,active + 2).forEach(this.append.bind(this))

        items[active].toggle()

        scroll.update(items[active].render())
    }

    this.up = function(){
        active--

        if(active < 0){
            active = 0

            Controller.toggle('head')
        }
        else{
            items[active].toggle()
        }

        scroll.update(items[active].render())
    }

    this.start = function(){
        Controller.add('content',{
            toggle: ()=>{
                if(items.length){
                    items[active].toggle()
                }
            },
            back: this.back
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

        html = null
        network = null
        lezydata = null
    }
}

export default component