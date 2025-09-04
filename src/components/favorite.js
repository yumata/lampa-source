import Api from '../core/api/api'
import Category from '../interaction/items/category'
import Background from '../interaction/background'
import Utils from '../utils/utils'
import Router from '../core/router'
import EmptyRouter from '../interaction/empty/module/router'

/**
 * Компонент избранного, просмотр папки или истории
 * @param {*} object 
 * @returns 
 */

function component(object){
    let comp = Utils.createInstance(Category, object, {
        empty: {
            type: object.type,
            router: 'favorites'
        }
    })

    comp.use(EmptyRouter, 0)

    comp.use({
        onCreate: function(){
            Api.favorite(object, this.build.bind(this), this.empty.bind(this))
        },
        onNext: function(resolve, reject){
            Api.favorite(object, resolve.bind(this), reject.bind(this))
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