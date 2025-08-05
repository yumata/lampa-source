import Template from './template'
import Lang from '../utils/lang'
import Emit from '../utils/emit'

class More extends Emit{
    constructor(params = {}){
        super()

        this.params = params
    }

    create(){
        this.html = Template.js('more')

        this.html.find('.card-more__title').html(this.params.text || Lang.translate('more'))

        this.emit('create')
    }

    render(js){
        return js ? this.html : $(this.html)
    }

    destroy(){
        this.html.remove()

        this.emit('destroy')
    }
}

export default More