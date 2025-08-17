import Template from './template'
import Lang from '../utils/lang'
import Emit from '../utils/emit'

function hasOpaqueBackground(el) {
    const bg = getComputedStyle(el).backgroundColor;

    // Если background-color: transparent
    if (bg === 'transparent') return false;

    // Если rgba(0, 0, 0, 0) или любая с alpha = 0
    const match = bg.match(/rgba?\(([^)]+)\)/);

    if (match) {
        const parts = match[1].split(',').map(p => p.trim());
        const alpha = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
        return alpha > 0;
    }

    // Если это rgb(...) или hex — значит непрозрачный
    return true;
}

class More extends Emit{
    constructor(params = {}){
        super()

        this.params = params
    }

    create(){
        this.html = Template.js('more')

        this.html.find('.card-more__title').html(this.params.text || Lang.translate('more'))

        this.params.style && this.html.addClass('card-more--' + this.params.style)

        this.emit('create')
    }

    size(target){
        if(!target) return

        let elements = [target].concat(
            Array.from(target.querySelectorAll('*'))
        )

        let max_area = 0
        let biggest_element = null

        elements.forEach(el => {
            let rect = el.getBoundingClientRect()
            let area = rect.width * rect.height

            if (area > max_area && hasOpaqueBackground(el)) {
                max_area = area

                biggest_element = el
            }
        })

        if(biggest_element){
            let rect = biggest_element.getBoundingClientRect()

            this.html.style.width  = (rect.width > rect.height ? rect.height : rect.width) + 'px'
            this.html.find('.card-more__box').style.height = rect.height + 'px'

            this.html.addClass('card-more--fixed-size')
        }
    }

    render(){
        return  this.html
    }

    destroy(){
        this.html.remove()

        this.emit('destroy')
    }
}

export default More