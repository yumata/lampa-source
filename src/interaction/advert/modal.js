import Template from '../template'
import Modal from '../modal'
import Controller from '../../core/controller'
import Utils from '../../utils/utils'
import Manifest from '../../core/manifest'
import Device from '../../core/account/device'
import Permit from '../../core/account/permit'
import Platform from '../../core/platform'

function show(template_name){
    let enabled = Controller.enabled().name

    Modal.open({
        title: '',
        html: Template.get(template_name),
        onBack: ()=>{
            Modal.close()

            Controller.toggle(enabled)
        }
    })
}

function account(){
    let enabled = Controller.enabled().name
    let html    = Template.js('account_none')

    if(Platform.screen('tv')){
        let code = html.find('.account-modal-split__qr-code')
        let img  = html.find('.account-modal-split__qr-img')

        Utils.qrcode('https://' +  Manifest.cub_site + '/?new', code, ()=>{
            code.remove()
            img.removeClass('hide')

            Utils.imgLoad(img, Utils.protocol() + Manifest.qr_site, ()=>{
                img.addClass('loaded')
            })
        })
    }
    else html.addClass('account-modal-split--mobile').removeClass('layer--height')

    Modal.open({
        title: '',
        html: $(html),
        size: Platform.screen('tv') ? 'full' : 'medium',
        scroll: {
            nopadding: true
        },
        onSelect: ()=>{
            Modal.close()

            Device.login(()=>{
                Controller.toggle(enabled)
            })
        },
        onBack: ()=>{
            Modal.close()

            Controller.toggle(enabled)
        }
    })
}

function limited(){
    show('account_limited')
}

function premium(){
    let enabled = Controller.enabled().name
    let html    = Template.js('account_premium')

    if(Platform.screen('tv')){
        Utils.qrcode('https://' +  Manifest.cub_site + '/premium', html.find('.account-modal-split__qr-code'), ()=>{
            html.find('.account-modal-split__qr').remove()
        })
    }
    else html.addClass('account-modal-split--mobile').removeClass('layer--height')

    if(!Permit.token){
        let button = Template.elem('div', {class: 'simple-button simple-button--inline selector', text: 'Войти в аккаунт'})

        button.on('hover:enter', ()=>{
            Modal.close()

            Controller.toggle(enabled)

            account()
        })

        html.find('.account-modal-split__info').append(button)
    }

    Modal.open({
        title: '',
        html: $(html),
        size: Platform.screen('tv') ? 'full' : 'medium',
        scroll: {
            nopadding: true
        },
        onBack: ()=>{
            Modal.close()

            Controller.toggle(enabled)
        }
    })
}


export default {
    account,
    limited,
    premium
}