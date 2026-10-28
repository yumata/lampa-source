import Api from './api'
import Utils from '../../utils/utils'
import Storage from '../storage/storage'
import Template from '../../interaction/template'
import Manifest from '../manifest'
import Controller from '../controller'
import Noty from '../../interaction/noty'
import Loading from '../../interaction/loading'
import Lang from '../lang'
import Modal from '../../interaction/modal'
import Settings from '../../interaction/settings/settings'
import Reguest from '../../utils/reguest'
import Platform from '../platform'
import Android from '../android'
import Bell from '../../interaction/bell'
import DeviceInput from '../../interaction/device_input'

function init(){
    Settings.listener.follow('open',(e)=>{
        if(e.name == 'account') e.body.find('.settings--account-device-add').on('hover:enter', ()=>{
            login(()=>{
                Controller.toggle('settings_component')
            })
        })
    })
}

function add(value){
    let code = parseInt(value)

    if(!isNaN(code)){
        let network = new Reguest()

        Loading.start(()=>{
            network.clear()
    
            Loading.stop()
        })

        function login(error){
            network.silent(Api.url() + 'device/add',(result)=>{
                Loading.stop()

                Storage.set('account', result, true)
                Storage.set('account_email', result.email, true)
            
                window.location.reload()
            }, error,{
                code
            })
        }
    
        login((e)=>{
            if(network.errorCode(e) == 200){
                Loading.stop()

                Noty.show(Lang.translate('account_code_error'))
            }
            else{
                localStorage.setItem('protocol', window.location.protocol == 'https:' ? 'https' : 'http')

                login((e)=>{
                    Loading.stop()

                    Noty.show(Lang.translate(network.errorCode(e) == 200 ? 'account_code_error' : 'network_noconnect' ))
                })
            }
        })
    }
    else{
        Noty.show(Lang.translate('account_code_wrong'))
    }
}

/**
 * Чем открыть ссылку в браузере на этом устройстве
 * @returns {function|null} - null, если открыть нельзя (телевизор, приставка, Electron)
 */
function opener(){
    if(Platform.tv() || Platform.is(['philips', 'electron'])) return null

    if(Platform.is('android')){
        return typeof AndroidJS !== 'undefined' && typeof AndroidJS.openBrowser == 'function' ? Android.openBrowser : null
    }

    if(Platform.is('nw')){
        return typeof nw !== 'undefined' && nw.Shell && nw.Shell.openExternal ? (link)=>nw.Shell.openExternal(link) : null
    }

    return typeof window.open == 'function' ? (link)=>window.open(link, '_blank') : null
}

/**
 * Адрес сайта в тексте окна — по клику копировать ссылку (на ТВ буфер обмена не нужен).
 * Не selector: адрес стоит в тексте сбоку от кнопок, пульт до него не дойдёт и застрянет на нём
 * @param {jQuery} html - окно
 * @param {function} link - возвращает ссылку для копирования
 */
function copySite(html, link){
    if(Platform.tv()) return

    html.find('.account-modal__site').addClass('account-modal__site--copy').prepend('<svg><use xlink:href="#sprite-copy"></use></svg>').on('click', (e)=>{
        if(!DeviceInput.canClick(e.originalEvent)) return

        Utils.copyTextToClipboard(link(), ()=>{
            Bell.push({text: Lang.translate('copy_secuses')})
        }, ()=>{
            Bell.push({text: Lang.translate('copy_error')})
        })
    })
}

/**
 * Вход кодом на экране: Lampa показывает код и QR, пользователь подтверждает вход на {site}/activate,
 * Lampa опрашивает device/token и получает тот же токен, что и через device/add
 * @param {function} callback - после закрытия окна
 */
function login(callback){
    let html    = Template.get('account_device_code')
    let network = new Reguest()
    let code    = html.find('.account-modal-split__device-code')
    let status  = html.find('.account-modal-split__status')
    let qr      = html.find('.account-modal-split__qr-code')
    let open    = opener()
    let closed  = false
    let timer, expires, current

    if(Platform.tv()) html.addClass('layer--' + (Platform.mouse() ? 'wheight' : 'height'))
    else html.addClass('account-modal-split--mobile')

    function stop(){
        closed = true

        clearTimeout(timer)

        network.clear()
    }

    // окно могли закрыть не через «Назад» (закрытие всех окон) — тогда прекращаем опрос
    function alive(){
        if(!closed && !document.body.contains(html[0])) stop()

        return !closed
    }

    function wait(call, seconds){
        clearTimeout(timer)

        timer = setTimeout(call, seconds * 1000)
    }

    function draw(user_code){
        current = user_code

        code.text(user_code)

        status.text(Lang.translate('account_device_code_wait'))

        if(Platform.tv()){
            Utils.qrcode('https://' + Manifest.cub_site + '/activate?code=' + user_code, qr, ()=>{
                html.find('.account-modal-split__qr').addClass('hide')
            })
        }
    }

    // новый код; при ошибке сети — повтор через 10 секунд
    function request(){
        if(!alive()) return

        network.silent(Api.url() + 'device/code', (result)=>{
            if(!alive()) return

            expires = Date.now() + (result.expires_in || 600) * 1000

            draw(result.user_code)

            poll(result.device_code, result.interval || 5)
        }, ()=>{
            if(!alive()) return

            status.text(Lang.translate('network_noconnect'))

            wait(request, 10)
        }, {
            client: 'lampa'
        })
    }

    function poll(device_code, interval){
        wait(()=>{
            if(!alive()) return

            if(Date.now() > expires) return request()

            network.silent(Api.url() + 'device/token', (result)=>{
                if(!alive()) return

                if(result.status == 'approved'){
                    stop()

                    delete result.status

                    Storage.set('account', result, true)
                    Storage.set('account_email', result.email, true)

                    window.location.reload()
                }
                else poll(device_code, result.interval || interval)
            }, (e)=>{
                if(!alive()) return

                let error = network.errorCode(e)

                // 803 — вход отклонён на сайте, 804 — код устарел: показываем новый код
                if(error == 803 || error == 804){
                    request()

                    if(error == 803) Noty.show(Lang.translate('account_device_code_denied'))
                }
                else poll(device_code, interval)
            }, {
                device_code
            })
        }, interval)
    }

    // сайт с текущим кодом — там остаётся только подтвердить вход
    function link(){
        return 'https://' + Manifest.cub_site + '/activate' + (current ? '?code=' + current : '')
    }

    if(open){
        html.find('.account-modal-split__open').on('hover:enter', ()=>{
            open(link())
        })
    }
    else html.find('.account-modal-split__open').remove()

    copySite(html, link)

    html.find('.account-modal-split__manual').on('hover:enter', ()=>{
        stop()

        Modal.close()

        manual(callback)
    })

    Modal.open({
        title: '',
        html: html,
        size: Platform.tv() ? 'full' : 'medium',
        scroll: {
            nopadding: true
        },
        onBack: ()=>{
            stop()

            Modal.close()

            callback && callback()
        }
    })

    request()
}

/**
 * Старый способ: ввод 6-значного кода с {site}/add
 * @param {function} callback - после закрытия окна
 */
function manual(callback){
    let html = Template.get('account_add_device_new')
    let nums = html.find('.account-modal-split__code-num')
    let keyboard

    if(Platform.tv()){
        let code = html.find('.account-modal-split__qr-code')
        let img  = html.find('.account-modal-split__qr-img')

        html.addClass('layer--' + (Platform.mouse() ? 'wheight' : 'height'))

        Utils.qrcode('https://' +  Manifest.cub_site + '/add', code, ()=>{
            code.remove()
            img.removeClass('hide')

            Utils.imgLoad(img, Utils.protocol() + Manifest.qr_device_add, ()=>{
                img.addClass('loaded')
            })
        })
    }
    else html.addClass('account-modal-split--mobile')

    copySite(html, ()=>'https://' + Manifest.cub_site + '/add')

    function drawCode(value){
        nums.find('span').text('-')

        value.split('').forEach((v,i)=>{
            if(nums[i]) nums[i].find('span').text(v)
        })
    }

    drawCode('')

    Modal.open({
        title: '',
        html: html,
        size: Platform.tv() ? 'full' : 'medium',
        scroll: {
            nopadding: true
        },
        onBack: ()=>{
            keyboard.destroy()

            Modal.close()

            callback && callback()
        }
    })

    keyboard = new window.SimpleKeyboard.default({
        display: {
            '{BKSP}': '&nbsp;',
            '{ENTER}': '&nbsp;',
        },

        layout: {
            'default': [
                '0 1 2 3 4 {BKSP}',
                '5 6 7 8 9 {ENTER}',
            ]
        },

        onChange: (value)=>{
            drawCode(value)

            if(value.length == 6) add(value)
        },

        onKeyPress: (button)=>{
            if(button === '{BKSP}'){
                keyboard.setInput(keyboard.getInput().slice(0, -1))

                drawCode(keyboard.getInput())
            }
            else if(button === '{ENTER}'){
                if(keyboard.getInput().length == 6) add(keyboard.getInput())
            }
        }
    })

    let keys = $('.simple-keyboard .hg-button').addClass('selector')
    
    Controller.collectionSet($('.simple-keyboard'))

    Controller.collectionFocus(keys[0], $('.simple-keyboard'))

    $('.simple-keyboard .hg-button').on('hover:enter',function(e){
        Controller.collectionFocus($(this)[0])

        keyboard.handleButtonClicked($(this).attr('data-skbtn'),e)
    })
}

export default {
    init: Utils.onceInit(init),
    login,
    manual
}