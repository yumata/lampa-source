import Scroll from '../../scroll'
import Controller from '../../controller'
import Emit from '../../../utils/emit'
import Storage from '../../../utils/storage'
import Empty from '../../empty'
import Arrays from '../../../utils/arrays'

class Main extends Emit{
    constructor(object){
        super()

        Arrays.extend(object, {params: {}})

        this.object  = object
        this.params  = object.params
        this.scroll  = new Scroll({mask:true, over: true, scroll_by_item:true, end_ratio: 2})
        this.html    = document.createElement('div')

        this.emit('init')
    }
    
    create(){
        this.activity.loader(true)

        this.scroll.minus()

        this.html.append(this.scroll.render(true))

        this.emit('create')
    }

    empty(status){
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

        this.scroll.nopadding()

        this.html.append(empty.render(true))

        this.start = empty.start.bind(empty)

        this.emit('empty', empty, status)

        this.activity.loader(false)

        this.activity.toggle()
    }

    build(data){
        this.emit('build', data)

        this.activity.loader(false)

        this.activity.toggle()
    }

    start(){
        let controller = {
            link: this,
            toggle: ()=>{
                if(this.activity.canRefresh()) return false

                if(this.items.length) this.items[this.active].toggle()
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
            back: this.emit.bind(this, 'back')
        }

        this.emit('controller', controller)

        Controller.add('content', controller)

        Controller.toggle('content')
    }

    render(js){
        return js ? this.html : $(this.html)
    }

    destroy(){
        this.scroll.destroy()

        this.html.remove()

        this.emit('destroy')
    }
}

export default Main
