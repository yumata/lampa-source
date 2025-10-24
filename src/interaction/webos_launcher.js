import Settings from './settings/settings'
import Platform from '../core/platform'
import Lang from '../core/lang'
import Noty from './noty'

/**
 * LG webOS добавление/удаление приложения из лаунчера, но только для виджетов ручной установки
 */
function init(){
    if(!Platform.is('webos')) return

    let field = $(`<div class="settings-folder selector" data-component="webos_launcher">
        <div class="settings-folder__icon">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 32 32" xml:space="preserve">
                <g transform="matrix(1.06,0,0,1.06,-0.9600000000000009,-0.9600000000000009)">
                    <path d="m26.59 31h-21.18c-2.431 0-4.41-1.979-4.41-4.41v-21.18c0-2.431 1.979-4.41 4.41-4.41h21.18c2.431 0 4.41 1.979 4.41 4.41v21.18c0 2.431-1.979 4.41-4.41 4.41zm-21.18-28c-1.329 0-2.41 1.081-2.41 2.41v21.18c0 1.329 1.081 2.41 2.41 2.41h21.18c1.329 0 2.41-1.081 2.41-2.41v-21.18c0-1.329-1.081-2.41-2.41-2.41z" fill="#fff"></path>
                    <path d="m21.129 24h-10.258c-1.583 0-2.871-1.288-2.871-2.871v-6.167c0-.925.449-1.798 1.202-2.336l5.129-3.664c.998-.712 2.339-.712 3.337 0l5.129 3.665c.754.537 1.203 1.41 1.203 2.335v6.167c0 1.583-1.288 2.871-2.871 2.871zm-5.635-13.41-5.129 3.664c-.229.163-.365.428-.365.708v6.167c0 .48.391.871.871.871h10.259c.479 0 .87-.391.87-.871v-6.167c0-.281-.136-.545-.364-.708l-5.129-3.665c-.303-.215-.71-.215-1.013.001z" fill="#fff"></path>
                </g>
            </svg>
        </div>
        <div class="settings-folder__name">${Lang.translate('settings_webos_launcher')}</div>
    </div>`)
    
    Settings.main().render().find('[data-component="more"]').after(field)
    Settings.main().update()

    Lampa.Template.add('settings_webos_launcher',`<div>
        <div class="settings-param selector" data-name="add" data-static="true">
            <div class="settings-param__name">#{settings_webos_launcher_add_device}</div>
        </div>
        <div class="settings-param selector" data-name="remove" data-static="true">
            <div class="settings-param__name">#{settings_webos_launcher_remove_device}</div>
        </div>
    </div>`)

    Settings.listener.follow('open', function (e) {
        let appid = webOS.fetchAppId()

        console.log('WebOS', 'current appid:', appid)

        if(appid.length == 0) appid = window.lampa_settings.iptv ? 'icva' : 'com.lampa.tv'

        if(e.name == 'webos_launcher'){
            e.body.find('[data-name="add"]').unbind('hover:enter').on('hover:enter',()=>{
                webOS.service.request("luna://com.webos.service.eim", {
                    method: "addDevice",
                    parameters: {
                        "appId": appid,
                        "pigImage": "/pigImage.jpg",
                        "type": "MVPD_IP",
                        "showPopup": true,
                        "label": "Lampa",
                        "description": "Lampa app for LG webOS",
                    },
                    onSuccess: function (res) {
                        Noty.show(Lang.translate('settings_added'))
                    },
                    onFailure: function (res) {
                        Noty.show(Lang.translate('title_error') + ': ' + res.errorText)
                    }
                })
            })

            e.body.find('[data-name="remove"]').unbind('hover:enter').on('hover:enter',()=>{
                webOS.service.request("luna://com.webos.service.eim", {
                    method: "deleteDevice",
                    parameters: {
                        "appId": appid,
                        "showPopup": true
                    },
                    onSuccess: function (res) {
                        Noty.show(Lang.translate('settings_added'))
                    },
                    onFailure: function (res) {
                        Noty.show(Lang.translate('title_error') + ': ' + res.errorText)
                    }
                })
            })
        }
    })
}

export default {
    init
}