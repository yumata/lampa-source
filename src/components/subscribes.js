import Category from '../interaction/items/category'
import Background from '../interaction/background'
import Utils from '../utils/utils'
import Account from '../core/account/account'
import Router from '../core/router'
import EmptyRouter from '../interaction/empty/module/router'

/**
 * Компонент "Подписки"
 * @param {*} object 
 * @returns 
 */
function component(object){
    let comp = Utils.createInstance(Category, object)

    comp.use(EmptyRouter, 0)

    comp.use({
        onCreate: function(){
            Account.Api.subscribes(object, this.build.bind(this), this.empty.bind(this))
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