import Api from '../interaction/api'
import Items from '../interaction/items/main'

function component(object){
    let comp = new Items(object)

    comp.create = function(){
        this.activity.loader(true)

        Api.main(object,this.build.bind(this),this.empty.bind(this))

        return this.render()
    }

    return comp
}

export default component