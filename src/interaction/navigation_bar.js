import Platform from '../core/platform'
import Template from '../interaction/template'
import Activity from './activity/activity'
import Lang from '../core/lang'
import Storage from '../core/storage/storage'
import Controller from '../core/controller'

/**
 * Инициализирует навигационную панель (только для мобильных устройств)
 * @returns {void}
 */
function init(){
    if(Platform.screen('mobile')){
        let bar = Template.get('navigation_bar',{})

        bar.find('.navigation-bar__item').on('click',function(){
            let action = $(this).data('action')

            if(action == 'back') Controller.back()
            else if(action == 'main'){
                Activity.push({
                    url: '',
                    title: Lang.translate('title_main') + ' - ' + Storage.field('source').toUpperCase(),
                    component: 'main',
                    source: Storage.field('source')
                })
            }
            else if(action == 'search'){
                Lampa.Search.open()
            }
            else if(action == 'settings'){
                Controller.toggle('settings')
            }
        })

        $('body').append(bar)
    }
}

export default {
    init
}