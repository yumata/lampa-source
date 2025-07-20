import Template from '../../template'
import Scroll from '../../scroll'
import Controller from '../../controller'
import Layer from '../../../utils/layer'

class Line{
    constructor(params = {}){
        this.params = params
    }

    create(){
        this.html    = Template.js('items_line')
        this.body    = this.html.find('.items-line__body')
        this.scroll  = new Scroll({horizontal:true, step: this.params.step || 300})

        this.scroll.onWheel = this.onWheel.bind(this)

        this.html.addClass('items-line--type-' + (this.params.type || 'none'))

        this.html.addEventListener('visible',this.onVisible.bind(this))

        this.body.append(this.scroll.render(true))
    }

    append(elem){
        this.scroll.append(elem)
    }

    onWheel(step){
        if(!Controller.own(this)) this.toggle()

        Controller.enabled().controller[step > 0 ? 'right' : 'left']()
    }

    onScroll(){}

    onVisible(){
        Layer.visible(this.scroll.render(true))
    }

    onToggle(){
        Controller.collectionSet(this.scroll.render(true))
        Controller.collectionFocus(false, this.scroll.render(true))
    }

    onUp(){}
    
    onDown(){}

    onBack(){}

    render(js){
        return js ? this.html : $(this.html)
    }

    toggle(){
        Controller.add('items_line',{
            link: this,
            toggle: this.onToggle.bind(this),
            right: ()=>{
                if(Navigator.canmove('right')) Navigator.move('right')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else if(this.onLeft) this.onLeft()
                else Controller.toggle('menu')
            },
            down: this.onDown.bind(this),
            up: this.onUp.bind(this),
            back: this.onBack.bind(this),
        })

        Controller.toggle('items_line')
    }

    destroy(){
        this.scroll.destroy()

        this.html.remove()
    }
}

export default Line
