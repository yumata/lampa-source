import Constructor from '../constructor'
import Template from '../template'
import Callback from '../../core/module/callback'

class CardParser extends Constructor({}) {
    constructor(data){
        super(data)

        this.use(Callback)
    }

    create(){
        this.html = Template.js('card_parser', this.data)

        this.html.on('visible', this.emit.bind(this, 'visible'))

        this.emit('create')
    }
}

export default CardParser