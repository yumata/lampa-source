import Controller from '../core/controller'
import Modal from './modal'
import Utils from '../utils/utils'
import Select from './select'
import Lang from '../core/lang'

let html
let controll
let active = {}

/**
 * Открыть менеджер хранилища
 * @param {object} [params] - параметры
 * @param {function} [params.onBack] - вызывается при выходе из менеджера
 * @returns {void}
 */
function open(params = {}){
    active = params

    controll = Controller.enabled().name

    html = $('<div></div>')

    let keys = Object.keys(localStorage)
    let hide = ['parental_', 'vast_', 'account_']

    if(window.lampa_settings.hide_important_params){
        keys = keys.filter(key=>{
            return !hide.find(h=>key.indexOf(h) == 0)
        })
    }

    keys.sort((a, b) =>a.localeCompare(b))

    keys.forEach((key)=>{
        let value = Utils.shortText(localStorage.getItem(key), 50)

        // Не показывать метки времени
        if(parseInt(value) > 0 && (value + '').length == 13) return

        let line = $('<div class="console__line selector"><span style="color: hsl(105, 50%, 65%)">' + key + '</span> ' + value + '</div>')

        line.on('hover:enter', () => {
            Select.show({
                title: key,
                items: [
                    {
                        title: Lang.translate('settings_remove'),
                        action: 'delete',
                    }
                ],
                onSelect: (selected) => {
                    Controller.toggle('modal')

                    if(selected.action == 'delete'){
                        localStorage.removeItem(key)
                        line.remove()
                    }
                },
                onBack: ()=>{
                    Controller.toggle('modal')
                }
            })
        })

        html.append(line)
    })

    Modal.open({
        title: 'StorageManager',
        size: 'large',
        html: html,
        onBack: close
    })
}

function close(){
    html.remove()

    Modal.close()

    if(active.onBack) active.onBack()
    else Controller.toggle(controll)

    active = {}
}

export default {
    close,
    open
}