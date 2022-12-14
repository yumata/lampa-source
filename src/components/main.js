import Api from '../interaction/api'

function component(object){
    let comp = new Lampa.InteractionMain(object)

    comp.create = function(){
        this.activity.loader(true)

        let next = Api.main(object,this.build.bind(this),this.empty.bind(this))

        if(typeof next == 'function') this.next = next

        return this.render()
    }

    return comp
}

export default component