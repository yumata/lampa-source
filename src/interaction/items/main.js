import Controller from '../controller'
import Line from './line/full'
import Scroll from '../scroll'
import Activity from '../activity'
import Empty from '../empty'
import Arrays from '../../utils/arrays'
import Storage from '../../utils/storage'
import Lang from '../../utils/lang'
import Layer from '../../utils/layer'
import Emit from '../../utils/emit'
import Utils from '../../utils/math'

class Main extends Emit {
    constructor(object){
        super()

        this.object  = object || {}
        this.scroll  = new Scroll({mask:true, over: true, scroll_by_item:true, end_ratio: 2})
        this.items   = []
        this.html    = document.createElement('div')
        this.active  = 0

        this.builded_time = Date.now()

        this.emit('init')
    }
    
    create(){
        this.emit('create')
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

        this.emit('empty')

        this.activity.loader(false)

        this.activity.toggle()
    }

    next(){
        if(!this.next_wait && this.items.length && this.builded_time < Date.now() - 1000){
            this.next_wait = true

            this.emit('next', (new_data)=>{
                this.next_wait = false

                if(!this.items.length) return

                console.log('next', new_data, this)

                new_data.forEach(this.append.bind(this))

                Layer.visible(this.items[this.active+1].render(true))
            },()=>{
                this.next_wait = false
            })
        } 
    }

    build(data){
        this.data = data

        this.scroll.minus()

        this.scroll.onWheel = (step)=>{
            if(!Controller.own(this)) this.start()

            if(step > 0) this.down()
            else if(this.active > 0) this.up()
        }
        
        this.scroll.onEnd = this.next.bind(this)

        this.emit('build', data)

        data.forEach(this.append.bind(this))

        this.html.append(this.scroll.render(true))

        Layer.update(this.html)

        this.activity.loader(false)

        this.activity.toggle()

        Layer.visible(this.html)
    }

    append(element){
        let item = Utils.createInstance(Line, element)

        this.emit('instance', item, element)

        item.use({
            onDown: this.down.bind(this),
            onUp: this.up.bind(this),
            onBack: this.back.bind(this),
            onLeft: ()=>{ 
                Controller.toggle('menu') 
            }
        })

        item.create()

        this.items.push(item)

        this.emit('append', item, element)

        this.scroll.append(item.render(true))
    }

    back(){
        Activity.backward()
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

    render(js){
        return js ? this.html : $(this.html)
    }

    destroy(){
        Arrays.destroy(this.items)

        this.scroll.destroy()

        this.html.remove()

        this.items = []

        this.emit('destroy')
    }
}

export default Main