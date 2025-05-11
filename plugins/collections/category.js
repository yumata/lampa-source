import Api from './api'

function component(object){
    let comp = new Lampa.InteractionCategory(object)

    comp.create = function(){
        Api.collection(object, this.build.bind(this),this.empty.bind(this))
    }

    comp.nextPageReuest = function(object, resolve, reject){
        Api.collection(object, resolve.bind(comp), reject.bind(comp))
    }

    comp.cardRender = function(object, element, card){
        card.onMenu = false

        card.onEnter = ()=>{
            Lampa.Activity.push({
                url: element.id,
                title: element.title,
                component: 'cub_collection',
                page: 1
            })
        }
    }

    return comp
}

export default component