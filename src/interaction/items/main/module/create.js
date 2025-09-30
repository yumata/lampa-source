import Utils from '../../../../utils/utils'
import Line from '../../line/line'

export default {
    onCreateAndAppend: function(element){
        let item = Utils.createInstance(Line, element)
        
        this.emit('instance', item, element)

        item.create()

        this.emit('append', item, element)
    }
}