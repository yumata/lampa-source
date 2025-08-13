import Utils from '../../../../utils/math'
import Line from '../../line/full'

class Module{
    onCreateAndAppend(element){
        let item = Utils.createInstance(Line, element)
        
        this.emit('instance', item, element)

        item.create()

        this.emit('append', item, element)
    }
}

export default Module