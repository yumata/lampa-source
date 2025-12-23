import Storage from '../core/storage/storage'
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
            check(Storage.field('torrserver_use_link') == 'one' ? 'torrserver_url' : 'torrserver_url_two')
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