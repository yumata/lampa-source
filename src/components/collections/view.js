import Api from '../../interaction/api'
import Items from '../../interaction/items/category'

function component(object){
    let comp = new Items(object)

    comp.create = function(){
        Api.collections(object,this.build.bind(this),this.empty.bind(this))
    }

    return comp
}

export default component