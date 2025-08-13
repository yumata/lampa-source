import Api from '../interaction/api'
import Category from '../interaction/items/category'
import Background from '../interaction/background'
import Utils from '../utils/math'
import Router from '../core/router'

/**
 * Компонент "Релизы"
 * @param {*} object 
 * @returns 
 */
function component(object){
    let comp = Utils.createInstance(Category, object)

    comp.use({
        onCreate: function(){
            Api.relise(object, this.build.bind(this), this.empty.bind(this))
        },
        onNext: function(resolve, reject){
            Api.relise(object, resolve.bind(this), reject.bind(this))
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