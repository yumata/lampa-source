import Utils from '../utils/math'
import CUB from '../utils/api/cub'
import Category from '../interaction/items/category'
import CategoryModule from '../interaction/items/category/module/module'
import Discuss from '../interaction/discuss/full'
import DiscussModule from '../interaction/discuss/module/module'

/**
 * Компонент "Рекомендации"
 * @param {*} object 
 */

function component(object){
    let comp = Utils.createInstance(Category, object, {
        module: CategoryModule.only('Explorer', 'Next', 'Empty', 'Items'),
        items: {
            mapping: 'list'
        }
    })

    comp.use({
        onCreate: function(){
            CUB.discussGet(object, (data)=>{
                this.build({...data, results: data.result || []})
            }, this.empty.bind(this))
        },
        onNext: function(resolve, reject){
            CUB.discussGet(object, (data)=>{
                resolve({...data, results: data.result || []})
            }, reject)
        },
        onCreateAndAppend: function(element){
            let item = Utils.createInstance(Discuss, element, {
                module: DiscussModule.only('Line', 'Read'),
                line: {
                    full_text: true
                }
            })

            this.emit('instance', item, element)
            
            item.create()

            this.emit('append', item, element)
        }
    })

    return comp
}


export default component