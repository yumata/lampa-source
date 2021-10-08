import Template from './template'

function create(params = {}){
    let card = Template.get('more')

    if(params.card_small){
        card.addClass('card-more--small')
    }

    this.create = function(){
        card.on('hover:focus',(e)=>{
            this.onFocus(e.target)
        }).on('hover:enter',(e)=>{
            this.onEnter(e.target)
        })
    }

    this.render = function(){
        return card
    }

    this.destroy = function(){
        card.remove()

        card = null
    }
}

export default create