import Player from '../interaction/player'
import Activity from '../interaction/activity/activity'
import Timeline from '../interaction/timeline'

/**
 * Инициализация обновления карточек в фоне
 * @returns {void}
 */
function init(){
    Lampa.Listener.follow('favorite_update', (data)=>{
        push('update', data)
    })

    Player.listener.follow('destroy',()=>{
        setTimeout(()=>{
            if(Activity.active().movie) push('update', {card: Activity.active().movie})
        }, 1000)
    })

    Timeline.listener.follow('read',(e)=>{
        push('reset')
    })
}

function push(name, data){
    Activity.renderLayers(true).forEach((layer)=>{
        let cards = Array.from(layer.querySelectorAll('.card'))

        cards.forEach((card)=>{
            if(card.listener) card.listener.send(name, data)
        })
    })
}

export default {
    init
}