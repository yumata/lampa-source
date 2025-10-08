import Scroll from '../../scroll'
import Controller from '../../../core/controller'
import Emit from '../../../utils/emit'
import Arrays from '../../../utils/arrays'
import Activity from '../../activity/activity'

class Base extends Emit{
    constructor(object){
        super()

        Arrays.extend(object, {params: {}})

        this.object  = object
        this.params  = object.params
        this.scroll  = new Scroll({mask: true, over: true, step: 250, end_ratio: 2})
        this.html    = document.createElement('div')
        this.body    = document.createElement('div')
    }

    create(){
        this.activity.loader(true)

        this.scroll.minus()
        
        this.scroll.onWheel = (step)=>{
            if(!Controller.own(this)) this.start()

            Navigator.move(step > 0 ? 'down' : 'up')
        }

        this.scroll.append(this.body)
        
        this.html.append(this.scroll.render(true))

        this.emit('create')
    }

    build(data){
        this.emit('build', data)

        this.activity.loader(false)

        this.activity.toggle()
    }

    empty(status){
        this.scroll.nopadding()

        this.emit('empty', status)

        this.activity.loader(false)

        this.activity.toggle()
    }

    start(){
        this.emit('start')

        let controller = {
            link: this,
            invisible: true,
            toggle: ()=>{
                Controller.collectionSet(this.scroll.render(true))
                Controller.collectionFocus(this.last || false, this.scroll.render(true))

                this.emit('toggle')
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
        }

        this.emit('controller', controller)

        Controller.add('content', controller)

        Controller.toggle('content')
    }

    pause(){
        this.emit('pause')
    }

    render(js){
        return js ? this.html : $(this.html)
    }

    destroy(){
        this.scroll.destroy()

        this.html.remove()
        this.body.remove()

        this.emit('destroy')
    }
}

export default Base
