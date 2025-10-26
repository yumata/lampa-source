import Card from '../../../card/card'
import Utils from '../../../../utils/utils'

export default {
    onCreateAndAppend: function(element){
        try{
            let item = Utils.createInstance(Card, element)

            this.emit('instance', item, element)
            
            item.create()

            this.emit('append', item, element)
        }
        catch(e){
            console.warn('Warning', 'onCreateAndAppend error:', e.message, e.stack)
        }
    }
}