import Card from '../../../card/full'
import Utils from '../../../../utils/math'

class Module{
    onCreateAndAppend(element){
        let item = Utils.createInstance(Card, element, {
            card_category: true,
            card_explorer: this.explorer ? true : false
        })

        this.emit('instance', item, element)
        
        item.create()

        this.emit('append', item, element)
    }
}

export default Module