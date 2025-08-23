import Template from '../../template'
import Scroll from '../../scroll'
import Controller from '../../../core/controller'
import Layer from '../../../core/layer'
import Emit from '../../../utils/emit'
import Arrays from '../../../utils/arrays'
import Icon from './module/icon'

class Base extends Emit{
    constructor(data){
        super()

        Arrays.extend(data, {params: {}})

        Arrays.extend(data.params, {
            type: 'default',
            items: {
                mapping: 'line',
                align_left: false,
                view: 6
            },
            scroll: {
                horizontal: true,
                step: 300
            }
        })

        this.data    = data
        this.params  = data.params
        this.html    = Template.js('items_line', data)
        this.body    = this.html.find('.items-line__body')
        this.scroll  = new Scroll(data.params.scroll)
    }

    create(){
        this.scroll.onWheel = this.wheel.bind(this)

        this.html.addClass('items-line--type-' + this.params.type)

        if(!this.data.title && !this.has(Icon)) this.html.find('.items-line__head')?.remove()

        this.html.on('visible', this.visible.bind(this))

        this.body.append(this.scroll.render(true))

        this.emit('create')
    }

    wheel(step){
        if(!Controller.own(this)) this.toggle()

        Controller.enabled().controller[step > 0 ? 'right' : 'left']()

        this.emit('wheel')
    }

    visible(){
        this.emit('visible')

        Layer.visible(this.scroll.render(true))
    }

    toggle(){
        let controller = {
            link: this,
            toggle: ()=>{
                Controller.collectionSet(this.scroll.render(true))
                Controller.collectionFocus(this.last || false, this.scroll.render(true))

                this.emit('toggle')
            },
            right: ()=>{
                if(Navigator.canmove('right')) Navigator.move('right')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else this.emit('left')
            },
            down: this.emit.bind(this, 'down'),
            up: this.emit.bind(this, 'up'),
            back: this.emit.bind(this, 'back'),
        }

        this.emit('controller', controller)

        Controller.add('items_line', controller)

        Controller.toggle('items_line')
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

export default Base
