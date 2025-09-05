import Template from '../template'
import Modal from '../modal'
import Controller from '../../core/controller'
import Utils from '../../utils/utils'
import Manifest from '../../core/manifest'
import Device from '../../core/account/device'
import Permit from '../../core/account/permit'

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

    let code = html.find('.account-modal-split__qr-code')
    let img  = html.find('.account-modal-split__qr-img')

    Utils.qrcode('https://' +  Manifest.cub_site + '/?new', code, ()=>{
        code.remove()
        img.removeClass('hide')

        Utils.imgLoad(img, Utils.protocol() + Manifest.qr_site, ()=>{
            img.addClass('loaded')
        })
    })

    Modal.open({
        title: '',
        html: $(html),
        size: 'full',
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

    Utils.qrcode('https://' +  Manifest.cub_site + '/premium', html.find('.account-modal-split__qr-code'), ()=>{
        html.find('.account-modal-split__qr').remove()
    })

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
        size: 'full',
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