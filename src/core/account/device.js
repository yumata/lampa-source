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

function login(callback){
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
    login
}