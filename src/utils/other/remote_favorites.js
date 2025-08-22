import Keypad from '../../core/keypad'
import Activity from '../../interaction/activity/activity'
import Lang from '../lang'
import Player from '../../interaction/player'

function init(){
    /** Быстрый доступ к закладкам через кнопки */

    let color_keys = {
        '406':'history',
        '405':'wath',
        '404':'like',
        '403':'book',
    }

    Keypad.listener.follow('keydown',(e)=>{
        if(!Player.opened()){
            if(color_keys[e.code]){
                let type = color_keys[e.code]

                Activity.push({
                    url: '',
                    title: type == 'book' ? Lang.translate('title_book') : type == 'like' ? Lang.translate('title_like'): type == 'history' ? Lang.translate('title_history') : Lang.translate('title_wath'),
                    component: 'favorite',
                    type: type,
                    page: 1
                })
            }
        }
    })
}

export default {
    init
}