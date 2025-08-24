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
import Input from '../../interaction/settings/input'
import Settings from '../../interaction/settings/settings'
import Reguest from '../../utils/reguest'

function init(){
    Settings.listener.follow('open',(e)=>{
        if(e.name == 'account') e.body.find('.settings--account-device-add').on('hover:enter', ()=>{
            login(()=>{
                Controller.toggle('settings_component')
            })
        })
    })
}

function login(callback){
    let displayModal = ()=>{
        let html = Template.get('account_add_device')

        Utils.imgLoad(html.find('img'), Utils.protocol() + Manifest.cub_domain+'/img/other/qr-add-device.png',()=>{
            html.addClass('loaded')
        })

        html.find('.simple-button').on('hover:enter',()=>{
            Modal.close()

            Input.edit({
                free: true,
                title: Lang.translate('account_code_enter'),
                nosave: true,
                value: '',
                layout: 'nums',
                keyboard: 'lampa',
            },(new_value)=>{
                let code = parseInt(new_value)

                if(new_value && new_value.length == 6 && !isNaN(code)){
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
                    displayModal()

                    if(new_value) Noty.show(Lang.translate('account_code_wrong'))
                }
            })
        })

        Modal.open({
            title: '',
            html: html,
            size: 'small',
            onBack: ()=>{
                Modal.close()

                callback && callback()
            }
        })
    }

    displayModal()
}

export default {
    init,
    login
}