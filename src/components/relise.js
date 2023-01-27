import Api from '../interaction/api'
import Items from '../interaction/items/category'

function component(object){
    let comp = new Items(object)

    comp.create = function(){
        this.activity.loader(true)
        
        Api.relise(object,this.build.bind(this),this.empty.bind(this))
    }

    comp.nextPageReuest = function(object, resolve, reject){
        Api.relise(object,resolve.bind(this), reject.bind(this))
    }

    return comp
}

export default component