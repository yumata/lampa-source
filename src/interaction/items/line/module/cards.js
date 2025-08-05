import Card from '../../../card/full'
import Utils from '../../../../utils/math'

class Module{
    onCreate(){
        this.scroll.body(true).addClass('items-cards')
    }

    onCreateAndAppend(element){
        let card = Utils.createInstance(Card, element)

        this.emit('instance', card, element)
        
        card.create()

        this.emit('append', card, element)
    }
}

export default Module