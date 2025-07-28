import Lang from '../../utils/lang'
import Input from '../settings/input'
import Template from '../../interaction/template'
import Storage from '../../utils/storage'
import Modal from '../../interaction/modal'
import Controller from '../../interaction/controller'

class Add{
    constructor(){
        this.html = document.createElement('div')
        this.html.classList.add('extensions__block-add')
        this.html.classList.add('selector')
        this.html.innerText = Lang.translate('extensions_add')

        this.html.addEventListener('hover:enter',()=>{
            if(!Storage.get('agree_installation')){
                let controller = Controller.enabled().name

                Modal.open({
                    title: Lang.translate('install_extension_rule_1'),
                    html: Template.get('plugins_rules'),
                    size: 'medium',
                    buttons_position: 'outside',
                    buttons: [
                        {
                            name: Lang.translate('settings_plugins_install'),
                            onSelect: ()=>{
                                Storage.set('agree_installation',true)

                                Modal.close()

                                Controller.toggle(controller)

                                this.input()
                            }
                        },
                        {
                            name: Lang.translate('cancel'),
                            onSelect: ()=>{
                                Modal.close()

                                Controller.toggle(controller)
                            }
                        }
                    ],
                    onBack: ()=>{
                        Modal.close()

                        Controller.toggle(controller)
                    }
                })
            }
            else{
                this.input()
            }
        })
    }

    input(){
        Input.edit({
            title: Lang.translate('extensions_set_url'),
            value: '',
            free: true,
            nosave: true,
            nomic: true
        },(new_value)=>{
            this.onAdd(new_value)
        })
    }

    render(){
        return this.html
    }
}

export default Add