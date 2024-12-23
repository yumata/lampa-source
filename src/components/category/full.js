import Api from '../../interaction/api'
import Items from '../../interaction/items/category'

function component(object){
    let comp = new Items(object)

    comp.create = function(){
        this.activity.loader(true)
        
        Api.list(object,this.build.bind(this),this.empty.bind(this))
    }

    return comp
}

export default component