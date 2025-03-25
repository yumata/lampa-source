import Keypad from '../../interaction/keypad'
import Modal from '../../interaction/modal'
import Controller from '../../interaction/controller'
import Lang from '../lang'
import Bell from '../../interaction/bell'
import Mirrors from '../mirrors'
import Account from '../account'

function init(){

    /** Start - активация режима GOD, жмем 🠔🠔 🠕🠕 🠖🠖 🠗🠗 */

    let mask = [37,37,38,38,39,39,40,40],
        psdg = -1

    Keypad.listener.follow('keydown',(e)=>{
        if(e.code == 37 && psdg < 0){
            psdg = 0
        }

        if(psdg >= 0 && mask[psdg] == e.code) psdg++
        else psdg = -1

        if(psdg == 8){
            psdg = -1

            console.log('God','enabled')

            Bell.push({text: 'God mode activated'})

            Mirrors.test(()=>{
                Bell.push({text: 'Mirrors test complite'})
            })

            Account.test(()=>{
                Bell.push({text: 'Account test complite'})
            })

            window.god_enabled = true
        }
    })

    /** Start - активация полной лампы, жмем 🠔🠔 🠕🠕 🠔🠔 🠕🠕 */

    let mask_full = [37,37,38,38,37,37,38,38],
        psdg_full = -1

    Keypad.listener.follow('keydown',(e)=>{
        if(e.code == 37 && psdg_full < 0){
            psdg_full = 0
        }

        if(psdg_full >= 0 && mask_full[psdg_full] == e.code) psdg_full++
        else psdg_full = -1

        if(psdg_full == 8){
            psdg_full = -1

            Bell.push({text: 'Full enabled'})

            window.localStorage.setItem('remove_white_and_demo','true')

            let controller = Controller.enabled().name

            Modal.open({
                title: '',
                align: 'center',
                zIndex: 300,
                html: $('<div class="about">'+Lang.translate('settings_interface_lang_reload')+'</div>'),
                buttons: [
                    {
                        name: Lang.translate('settings_param_no'),
                        onSelect: ()=>{
                            Modal.close()

                            Controller.toggle(controller)
                        }
                    },
                    {
                        name: Lang.translate('settings_param_yes'),
                        onSelect: ()=>{
                            window.location.reload()
                        }
                    }
                ]
            })
        }
    })
}

export default {
    init
}