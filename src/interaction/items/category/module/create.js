import Card from '../../../card/card'
import Utils from '../../../../utils/utils'

class Module{
    onCreateAndAppend(element){
        let item = Utils.createInstance(Card, element)

        this.emit('instance', item, element)
        
        item.create()

        this.emit('append', item, element)
    }
}

export default Module