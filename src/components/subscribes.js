import Items from '../interaction/items/category'
import Account from '../utils/account'

function component(object){
    let comp = new Items(object)

    comp.create = function(){
        this.activity.loader(true)

        Account.subscribes(object,this.build.bind(this),this.empty.bind(this))

        return this.render()
    }

    return comp
}

export default component