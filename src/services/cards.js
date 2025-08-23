import Player from '../interaction/player'
import Activity from '../interaction/activity/activity'
import Utils from '../utils/utils'

function init(){
    /** Обновление состояния карточек каждые 5 минут */

    let last_card_update = Date.now()
    let lets_card_update = ()=>{
        if(last_card_update < Date.now() - 1000 * 60 * 5){
            last_card_update = Date.now()

            Activity.renderLayers(true).forEach((layer)=>{
                let cards = Array.from(layer.querySelectorAll('.card'))

                cards.forEach((card)=>{
                    Utils.trigger(card, 'update')
                })
            })
        }
    }

    setInterval(()=>{
        if(!Player.opened()) lets_card_update()
    },1000 * 60)

    Player.listener.follow('destroy',()=>{
        setTimeout(lets_card_update, 1000)
    })

    Lampa.Listener.follow('activity',(e)=>{
        if(e.type == 'archive' && e.object.activity){
            let cards = Array.from(e.object.activity.render(true).querySelectorAll('.card.focus'))

            cards.forEach((card)=>{
                Utils.trigger(card, 'update')
            })
        }
    })
}

export default {
    init
}