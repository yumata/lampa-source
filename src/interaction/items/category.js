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
import Emit from '../../utils/emit'

class Category extends Emit {
    constructor(object){
        super()

        this.object  = object || {}
        this.scroll  = new Scroll({mask: true, over: true, step: 250, end_ratio: 2})
        this.items   = []
        this.html    = document.createElement('div')
        this.body    = document.createElement('div')
        this.active  = 0

        this.total_pages      = 1
        this.limit_view       = 12
        this.limit_collection = 36
        this.builded_time     = Date.now()

        this.last
        this.next_wait

        this.emit('init')
    }

    create(){
        this.emit('create')
    }

    build(data){
        if(!data.results.length) return this.empty()

        this.total_pages = data.total_pages || 1

        this.body.addClass('category-full')

        this.scroll.minus()
        
        this.scroll.onEnd    = this.next.bind(this)
        this.scroll.onScroll = this.limit.bind(this)
        this.scroll.onWheel  = (step)=>{
            if(!Controller.own(this)) this.start()

            if(step > 0) Navigator.move('down')
            else Navigator.move('up')
        }

        this.emit('build',data)

        data.results.forEach(element => this.append(element))

        this.scroll.append(this.body)
        
        this.html.append(this.scroll.render(true))

        this.limit()

        this.activity.loader(false)

        this.activity.toggle()

        this.builded_time = Date.now()
    }

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

        this.html.append(empty.render(true))

        this.start = empty.start

        this.activity.loader(false)

        this.activity.toggle()
    }

    append(element, to_collection){
        let item = Utils.createInstance(Card, element, {
            card_category: true
        })

        this.emit('instance', item, element)

        item.create()

        let render = item.render(true)

        render.on('hover:focus', ()=> {
            this.last = render

            this.active = this.items.indexOf(item)

            this.scroll.update(render)
        })

        render.on('hover:touch', ()=> {
            this.last = render

            this.active = this.items.indexOf(item)
        })

        render.on('hover:enter', ()=> {
            this.last = render
        })

        this.body.append(render)

        this.items.push(item)

        this.emit('append', item, element)

        if(to_collection) Controller.collectionAppend(render)
    }

    next(){
        if(!this.next_wait && this.items.length && this.builded_time < Date.now() - 1000){
            this.next_wait = true

            this.object.page++

            this.emit('next', (new_data)=>{
                this.next_wait = false

                if(!this.items.length) return

                new_data.results.forEach(element => this.append(element, true))

                this.limit()
            },()=>{
                this.next_wait = false
            })
        }
    }

    limit(){
        let colection = this.items.slice(Math.max(0, this.active - this.limit_view), this.active + this.limit_view)

        this.items.forEach(item=>{
            if(colection.indexOf(item) == -1){
                item.render(true).classList.remove('layer--render')
            }
            else{
                item.render(true).classList.add('layer--render')
            }
        })

        Navigator.setCollection(this.items.slice(Math.max(0, this.active - this.limit_collection), this.active + this.limit_collection).map(c=>c.render(true)))
        Navigator.focused(this.last)

        Layer.visible(this.scroll.render(true))
    }

    start(){
        Controller.add('content',{
            link: this,
            toggle: ()=>{
                if(this.activity.canRefresh()) return false

                Controller.collectionSet(this.scroll.render(true))
                Controller.collectionFocus(this.last || false, this.scroll.render(true))
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            right: ()=>{
                if(Navigator.canmove('right')) Navigator.move('right')
                else this.emit('right')
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

    refresh(){
        this.activity.needRefresh()
    }

    render(js){
        return js ? this.html : $(this.html)
    }

    destroy(){
        Arrays.destroy(this.items)

        this.scroll.destroy()

        this.html.remove()
        this.body.remove()

        this.items = []

        this.emit('destroy')
    }
}

export default Category