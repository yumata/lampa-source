import Storage from '../core/storage/storage'
import Account from '../core/account/account'
import Personal from '../core/personal'
import Platform from '../core/platform'
import Base64 from '../utils/base64'
import Noty from '../interaction/noty'
import Utils from '../utils/utils'
import Request from '../utils/reguest'
import Lang from '../core/lang'
import Settings from '../interaction/settings/settings'

let torrent_net = new Request()

/**
 * Инициализация работы с локальным торрент сервером, проверка доступности и настройка
 * @returns {void}
 */
function init(){
    Storage.listener.follow('change', function (e) {
        if (e.name == 'torrserver_url') check(e.name)
        if (e.name == 'torrserver_url_two') check(e.name)
        if (e.name == 'torrserver_use_link') check(e.value == 'one' ? 'torrserver_url' : 'torrserver_url_two')
    })

    Settings.listener.follow('open', function (e){
        if(e.name == 'server'){
            let name = Storage.field('torrserver_use_link') == 'one' ? 'torrserver_url' : 'torrserver_url_two'

            check(name)

            if(Lang.selected(['ru','be','uk']) && !Personal.confirm()){
                let ad = $(`
                    <div class="ad-server">
                        <div class="ad-server__text">
                            Не удаётся подключиться к локальному серверу? <br>tsarea.tv — готовый вариант без настроек.
                        </div>
                        <img class="ad-server__qr hide" style="opacity: 0; border-radius: 0.3em;">
                    </div>
                `)

                let cd = $('<div class="ad-server__qr"></div>')
                let im = ad.find('img')

                ad.append(cd)

                Utils.qrcode('https://t.me/tsarea_rentbot', cd, ()=>{
                    cd.remove()
                    im.removeClass('hide')
        
                    Utils.imgLoad(im, 'https://i.ibb.co/fVVYWnV2/qr-code-6.png', ()=>{
                        im.css('opacity', 1)
                    })
                })

                $('[data-name="torrserver_use_link"]',e.body).after(ad)
            }
        }
        else torrent_net.clear() 
    })
}

function check(name) {
    if(Platform.is('android') && !Storage.field('internal_torrclient')) return

    let item = $('[data-name="'+name+'"]').find('.settings-param__status').removeClass('active error wait').addClass('wait')
    let url  = Storage.get(name)

    if(url){
        torrent_net.timeout(10000)

        let head = {dataType: 'text'}
        let auth = Storage.field('torrserver_auth')

        if(auth){
            head.headers = {
                Authorization: "Basic " + Base64.encode(Storage.get('torrserver_login')+':'+Storage.value('torrserver_password'))
            }
        }

        torrent_net.native(Utils.checkEmptyUrl(Storage.get(name)), ()=>{
            item.removeClass('wait').addClass('active')
        }, (a, c)=> {
            if(a.status == 401){
                item.removeClass('wait').addClass('active')

                Noty.show(Lang.translate('torrent_error_check_no_auth') + ' - ' + url, {time: 5000})
            }
            else{
                item.removeClass('wait').addClass('error')

                Noty.show(torrent_net.errorDecode(a, c) + ' - ' + url, {time: 5000})
            }
        }, false, head)
    }
}

export default {
    init
}