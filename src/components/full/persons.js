import Person from '../../interaction/person/person'
import PersonModule from '../../interaction/person/module/module'
import Utils from '../../utils/math'
import Line from '../../interaction/items/line/line'
import LineModule from '../../interaction/items/line/module/module'


function Persons(data){
    Utils.extendItemsParams(data.results, {
        module: PersonModule.toggle(PersonModule.MASK.base, 'Line', 'Callback'),
        createInstance: (item)=>new Person(item),
        emit: {
            onEnter: (html, item)=>{
                console.log('Person entered:', item);
            }
        }
    })

    let comp = Utils.createInstance(Line, data, {
        module: LineModule.only('Items', 'Create')
    })

    return comp
}

export default Persons