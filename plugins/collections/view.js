import Api from './api'

function component(object){
    let comp = new Lampa.InteractionCategory(object)

    comp.create = function(){
        Api.full(object, (data)=>{
            this.build(data)

            comp.render().find('.category-full').addClass('mapping--grid cols--6')
        },this.empty.bind(this))
    }

    comp.nextPageReuest = function(object, resolve, reject){
        Api.full(object, resolve.bind(comp), reject.bind(comp))
    }

    return comp
}

export default component