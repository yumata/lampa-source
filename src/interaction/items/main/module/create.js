import Utils from '../../../../utils/utils'
import Line from '../../line/line'

export default {
    onCreateAndAppend: function(element){
        try{
            let item = Utils.createInstance(Line, element)
            
            this.emit('instance', item, element)

            item.create()

            this.emit('append', item, element)
        }
        catch(e){
            console.warn('Warning', 'onCreateAndAppend error:', e.message, e.stack)
        }
    }
}