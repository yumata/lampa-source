import Template from './template'
import Lang from '../utils/lang'

function create(params = {}){
    let card = Template.js('more')

    card.querySelector('.card-more__title').innerText = Lang.translate('more')

    if(params.card_small){
        card.classList.add('card-more--small')
    }

    this.create = function(){
        card.addEventListener('hover:focus',(e)=>{
            this.onFocus(e.target)
        })
        
        card.addEventListener('hover:enter',(e)=>{
            this.onEnter(e.target)
        })
    }

    this.render = function(js){
        return js ? card : $(card)
    }

    this.destroy = function(){
        card.remove()

        card = null
    }
}

export default create