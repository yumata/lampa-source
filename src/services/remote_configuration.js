import Lang from '../core/lang'
import Bell from '../interaction/bell'
import Storage from '../core/storage/storage'
import Settings from '../interaction/settings/settings'
import SettingsApi from '../interaction/settings/api'
import Arrays from '../utils/arrays'
import Manifest from '../core/manifest'
import Controller from '../core/controller'
import Utils from '../utils/utils'
import Plugions from '../core/plugins'


let max_wait_time = 300000 // 5 минут
let component     = 'remote_configuration'
let request_code  = ''
let request_time  = 0
let request_timer = false
let request_html  = null
let request_instlall_log = []

/**
 * Инициализация компонента удалённой конфигурации
 */
function init(){
    if(window.lampa_settings.disable_features.remote_configuration) return

    let icon = `<svg width="39" height="39" viewBox="0 0 39 39" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="1.5" y="1.5" width="35.501" height="35.501" rx="5.8" stroke="white" stroke-width="3"/>
        <rect x="20.7652" y="28.4988" width="12.2368" height="3.03369" rx="1.51685" fill="white"/>
        <rect x="6.61215" y="6.80011" width="16.1324" height="3.03369" rx="1.51685" fill="white"/>
        <rect x="6.61215" y="13.1458" width="12.2368" height="3.03369" rx="1.51685" fill="white"/>
        <rect x="6.61215" y="19.4221" width="12.2368" height="3.03369" rx="1.51685" fill="white"/>
        <rect x="25.3667" y="26.4175" width="10.2007" height="3.03369" rx="1.51685" transform="rotate(-90 25.3667 26.4175)" fill="white"/>
        <rect x="24.8747" y="25.3954" width="6.44481" height="3.03369" rx="1.51685" transform="rotate(-45 24.8747 25.3954)" fill="white"/>
        <rect x="26.5727" y="27.5406" width="6.44481" height="3.03369" rx="1.51685" transform="rotate(-135 26.5727 27.5406)" fill="white"/>
    </svg>`

    SettingsApi.addComponent({
        component,
        icon,
        name: Lang.translate('remote_configuration_settings_title'),
        before: 'more'
    })

    Settings.listener.follow('open', function (e){
        if(e.name == component){
            let waite = false
            let body  = e.body.find('.scroll__body > div')
            let html  = $(`<div>
                <div class="settings-param-text">
                    <div class="about">${Lang.translate('remote_configuration_registration_text')}</div>
                </div>
                <div class="settings-param-text">
                    <div class="modal__button selector" style="text-align: center;">${Lang.translate('remote_configuration_open_button')}</div>

                    <div class="broadcast__scan hide" style="margin-top: 1em;"><div></div></div>
                </div>
            </div>`)

            if(request_code){
                html = $(`<div>
                    <div class="settings-param-text">
                        <div class="about">${Lang.translate('remote_configuration_waite_text')}</div>
                    </div>
                    <div class="settings-param-text">
                        <div class="account-modal-split__code" style="width: 100%; margin-bottom: 0;"></div>
                    </div>
                    <div class="settings-param-text">
                        ${Lang.translate('remote_configuration_code_life')} <span class="timer"></span>
                    </div>
                    <div class="settings-param-text">
                        <div class="install-log"></div>
                    </div>
                </div>`)

                let str = (request_code + '').split('')

                str.forEach((num, i)=>{
                    html.find('.account-modal-split__code').append(`<div class="account-modal-split__code-num"><span>${num}</span></div>`)
                })

                request_html = html
            }

            let button  = $('.modal__button', html)
            let loading = $('.broadcast__scan', html)

            button.on('hover:enter', ()=>{
                if(waite) return

                waite = true

                loading.removeClass('hide')

                Lampa.Network.silent(api() + 'registration', (result)=>{
                    request_code = result.code
                    request_time = Date.now()

                    Settings.update()

                    start()

                    waite = false
                }, ()=>{
                    Bell.push({text: Lang.translate('remote_configuration_notice_nocode'), icon})

                    loading.addClass('hide')

                    waite = false
                })
            })

            body.append(html)
        }
    })
}

function api(){
    return Utils.protocol() + Manifest.cub_domain + '/api/remote-configuration/'
}

/**
 * Запуск таймера для отслеживания времени действия кода
 */
function start(){
    if(!request_code) return

    request_timer = setInterval(()=>{
        let time = Date.now() - request_time

        if(time > max_wait_time){
            request_code = ''
            request_time = 0
            request_html = null
            request_instlall_log = []

            clearInterval(request_timer)

            if(Controller.enabled().name == 'settings_component') Settings.update()
        }
        else if(request_html){
            let sec_num = Math.round((max_wait_time - time) / 1000)
            let minutes = Math.trunc((sec_num % 3600) / 60)
            let seconds = Math.round(sec_num % 60)

            request_html.find('.timer').text((minutes ? minutes + ' ' + Lang.translate('time_m') + ' ' : '') + (seconds + ' ' + Lang.translate('time_s')))

            // Показывать последние 4 действия
            request_html.find('.install-log').html(request_instlall_log.slice(-4).map(item=>`<div class="full-start-new__buttons" style="background: rgba(255,255,255, 0.15); padding: 0.8em; border-radius: 0.8em; margin-bottom: 0.6em;"><svg style="width: 1em; height: 1em; margin-right: 1em;"><use xlink:href="#sprite-${item.icon}"></use></svg> ${item.name} <span style="margin-left: auto; padding-left: 1em">${item.value}</span></div>`).join(''))
        }

        // Каждые 10 секунд делать запрос
        if(time % 10000 < 1000) accept()
    }, 1000)
}

/**
 * Принимать запросы на установку расширений и изменение настроек
 */
function accept(){
    Lampa.Network.silent(api() + 'accept?code=' + request_code, (result)=>{
        if(result.delivery.length) result.delivery.forEach(install)
    })
}

/**
 * Устанавливать расширения и изменять настройки согласно запросу
 */
function install(row){
    row.data.forEach(item=>{
        console.log('Remote configuration', 'install', item)

        try{
            if(item.type == 'extension'){
                Arrays.extend(item, {
                    author: '@lampa',
                    status: 1
                })

                if(item.url && !Plugions.get().find(ext=>ext.url == item.url)){
                    Plugions.add(item)

                    request_instlall_log.push({
                        name: Lang.translate('settings_main_plugins'),
                        value: Utils.shortText(item.url, 30),
                        icon: 'history'
                    })
                }
            }
            else if(item.type == 'storage'){
                Storage.set(item.name, item.value)

                request_instlall_log.push({
                    name: Lang.translate('title_settings'),
                    value: Utils.shortText(item.name, 30),
                    icon: 'settings'
                })
            }
            else if(item.type == 'reload'){
                setTimeout(()=>{
                    window.location.reload()
                }, 1000)
            }
        }
        catch(e){
            console.error('Remote configuration', 'install error', e)
        }
    })
}

export default {
    init
}