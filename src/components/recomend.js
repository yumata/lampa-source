import Background from '../interaction/background'
import Utils from '../utils/utils'
import Category from '../interaction/items/category'
import Router from '../core/router'
import Recomend from '../core/recomend'

/**
 * Компонент "Рекомендации по фильму/сериалу"
 * @param {*} object 
 */

function component(object){
    let comp = Utils.createInstance(Category, object)

    comp.use({
        onCreate: function(){
            Recomend.page(object, this.build.bind(this), this.empty.bind(this))
        },
        onNext: function(resolve, reject){
            Recomend.page(object, resolve.bind(this), reject.bind(this))
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