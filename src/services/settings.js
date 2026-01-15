import Settings from '../interaction/settings/settings'
import Storage from '../core/storage/storage'
import Modal from '../interaction/modal'
import Platform from '../core/platform'
import Lang from '../core/lang'
import Controller from '../core/controller'
import LangChoice from '../interaction/lang'

/**
 * Инициализация дополнительных настроек
 * @returns {void}
 */
function init(){
    Settings.listener.follow('open', function (e){
        if(e.name == 'more' && window.location.protocol == 'https:'){
            $('[data-name="protocol"]',e.body).remove()
        }

       
        if(e.name == 'interface' && window.lampa_settings.lang_use){
            $('.settings-param:eq(0)',e.body).on('hover:enter',()=>{
                LangChoice.open((code)=>{
                    Storage.set('language', code, true)
                    Storage.set('tmdb_lang',code, true)

                    window.location.reload()
                },()=>{
                    Controller.toggle('settings_component')
                })
            }).find('.settings-param__value').text(Lang.translate(Lang.codes()[Storage.get('language','ru')]))
        }

        if(e.name == 'main' && Platform.is('apple_tv')){
            let append = e.body.find('.appletv-setting')
           
            if(!append.length){
                append = $(`<div class="settings-folder selector appletv-setting" data-static="true">
                    <div class="settings-folder__icon">
                        <svg xmlns="http://www.w3.org/2000/svg" version="1.1" xmlns:xlink="http://www.w3.org/1999/xlink" width="512" height="512" x="0" y="0" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512" xml:space="preserve"><path d="M407 0H105C47.103 0 0 47.103 0 105v302c0 57.897 47.103 105 105 105h302c57.897 0 105-47.103 105-105V105C512 47.103 464.897 0 407 0zM163.393 193.211c9.844-12.975 23.53-13.038 23.53-13.038s2.035 12.199-7.744 23.95c-10.442 12.548-22.312 10.494-22.312 10.494s-2.228-9.868 6.526-21.406zm21.581 136.569c-8.754 0-15.559-5.899-24.783-5.899-9.399 0-18.727 6.119-24.801 6.119C117.987 330 96 292.326 96 262.043c0-29.795 18.611-45.425 36.066-45.425 11.348 0 20.154 6.544 26.053 6.544 5.065 0 14.464-6.961 26.698-6.961 21.06 0 29.344 14.985 29.344 14.985s-16.204 8.284-16.204 28.386c0 22.677 20.185 30.492 20.185 30.492s-14.109 39.716-33.168 39.716zM296.2 327.4c-5.2 1.6-10.668 2.4-16.4 2.4-17.8 0-27.2-9.8-27.2-25.8v-60.2h-13.8v-20.6h13.8v-34h26.8v34h22v20.6h-22V295c0 7.25 4.1 10.2 10 10.2 5.6 0 13-3.131 14.6-3.8l5.4 21.2c-3.6 1.6-8 3.2-13.2 4.8zm84.398.6h-29l-38.6-104.8h27.6l26.6 83 26.8-83h25.2l-38.6 104.8z" fill="#fff"></path></svg>
                    </div>
                    <div class="settings-folder__name">${Lang.translate('menu_settings')}</div>
                </div>`)

                e.body.find('.scroll__body > div').append(append)
            }

            append.unbind('hover:enter').on('hover:enter',()=>{
                window.open('lampa://showadvancedmenu')
            })
        }
    })
}

export default {
    init
}