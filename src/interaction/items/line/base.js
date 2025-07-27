import Template from '../../template'
import Scroll from '../../scroll'
import Controller from '../../controller'
import Layer from '../../../utils/layer'
import Emit from '../../../utils/emit'
import Arrays from '../../../utils/arrays'

class Base extends Emit{
    constructor(data){
        super()

        Arrays.extend(data, {params: {}})

        this.data    = data
        this.params  = data.params
        this.html    = Template.js('items_line')
        this.body    = this.html.find('.items-line__body')
        this.scroll  = new Scroll({horizontal:true, step: this.params.step || 300})
    }

    create(){
        this.scroll.onWheel = this.wheel.bind(this)

        this.data.title && this.html.find('.items-line__title').html(this.data.title)

        this.html.addClass('items-line--type-' + (this.params.type || 'none'))

        this.html.addEventListener('visible',this.visible.bind(this))

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
        Controller.add('items_line',{
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
        })

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
