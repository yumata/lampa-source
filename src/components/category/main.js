import Api from '../../interaction/api'

function component(object){
    let comp = new Lampa.InteractionMain(object)

    comp.create = function(){
        this.activity.loader(true)

        Api.category(object,this.build.bind(this),this.empty.bind(this))

        return this.render()
    }

    return comp
}

export default component