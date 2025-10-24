import Scroll from '../../scroll'
import Controller from '../../../core/controller'
import Emit from '../../../utils/emit'
import Arrays from '../../../utils/arrays'
import Platform from '../../../core/platform'

class Main extends Emit{
    constructor(object){
        super()

        Arrays.extend(object, {params: {}})

        this.object  = object
        this.params  = object.params
        this.scroll  = new Scroll({mask:true, over: true, scroll_by_item: true, end_ratio: 2})
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
        this.scroll.nopadding()

        this.emit('empty', status)

        this.activity.loader(false)

        this.activity.toggle()
    }

    build(data){
        this.emit('build', data)

        this.activity.loader(false)

        this.activity.toggle()
    }

    start(){
        this.emit('start')

        let controller = {
            link: this,
            toggle: ()=>{
                this.scroll.restorePosition()
                
                if(this.items.length && Platform.screen('tv')) this.items[this.active].toggle()
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

    pause(){
        this.emit('pause')
    }

    resize(){
        this.emit('resize')
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
