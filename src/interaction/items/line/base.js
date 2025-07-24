import Template from '../../template'
import Scroll from '../../scroll'
import Controller from '../../controller'
import Layer from '../../../utils/layer'
import Emit from '../../../utils/emit'

/* 
События

this.onAppend    = function(){}
this.onFocus     = function(){}
this.onEnter     = function(){}
this.onSelect    = function(){}
this.onMore      = function(){}
this.onFocusMore = function(){}
this.onLeft      = function(){}
this.onBack      = function(){}
this.onDown      = function(){}
this.onUp        = function(){}
*/

class Base extends Emit{
    constructor(data, params = {}){
        super()

        this.data    = data
        this.params  = params
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
                else if(this.onLeft) this.onLeft()
                else Controller.toggle('menu')
            },
            down: this.onDown && this.onDown.bind(this),
            up: this.onUp && this.onUp.bind(this),
            back: this.onBack ? Controller.toContent.bind(Controller) : this.onBack.bind(this),
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
