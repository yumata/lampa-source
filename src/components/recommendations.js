import Background from '../interaction/background'
import Utils from '../utils/utils'
import AI from '../core/api/sources/ai'
import Category from '../interaction/items/category'
import CategoryModule from '../interaction/items/category/module/module'
import EmptyModule from '../interaction/empty/module/ai'
import Router from '../core/router'

/**
 * Компонент "Рекомендации"
 * @param {*} object 
 */

function component(object){
    let comp = Utils.createInstance(Category, object, {
        module: CategoryModule.toggle(CategoryModule.MASK.base, 'Explorer', 'Loading', 'Next', 'Empty'),
        items: {
            cols: 5
        }
    })

    comp.use(EmptyModule)

    comp.use({
        onCreate: function(){
            AI.recommendations(object.card.id, object.card.name ? 'tv' : 'movie', (data)=>{
                if(data.results.length == 0) this.empty({status: 347})
                else this.build(data)
            }, this.empty.bind(this))
        },
        onInstance: function(item, data){
            item.use({
                onEnter: Router.call.bind(Router, 'full', data),
                onFocus: function(){
                    Background.change(Utils.cardImgBackground(data))
                }
            })
        }
    })

    return comp
}


export default component