import Utils from '../../../../utils/utils'
import Line from '../../line/line'

class Module{
    onCreateAndAppend(element){
        let item = Utils.createInstance(Line, element)
        
        this.emit('instance', item, element)

        item.create()

        this.emit('append', item, element)
    }
}

export default Module