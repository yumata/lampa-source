import Keypad from '../core/keypad'
import Modal from '../interaction/modal'
import Lang from '../core/lang'
import Bell from '../interaction/bell'
import DeviceInput from '../interaction/device_input'
import Storage from '../core/storage/storage'
import Settings from '../interaction/settings/api'
import Account from '../core/account/account'
import Arrays from '../utils/arrays'
import Manifest from '../core/manifest'

let open_about   = false
let press_button = 0
let buttons      = ['enabled','nopremium','nodemo','ads','fps']

let icon = `<svg width="49" height="49" viewBox="0 0 49 49" fill="none" xmlns="http://www.w3.org/2000/svg">
<rect x="2.41699" y="2.3418" width="44.2686" height="44.2686" rx="8.25" stroke="white" stroke-width="3.5"/>
<rect x="16.5352" y="16.6929" width="3.83008" height="11.0072" rx="1.91504" transform="rotate(45 16.5352 16.6929)" fill="white"/>
<rect width="3.83008" height="11.0072" rx="1.91504" transform="matrix(0.707107 -0.707107 -0.707107 -0.707107 16.5352 32.2593)" fill="white"/>
<rect width="3.83008" height="11.0072" rx="1.91504" transform="matrix(-0.707107 0.707107 0.707107 0.707107 32.5596 16.6929)" fill="white"/>
<rect x="32.5596" y="32.2593" width="3.83008" height="11.0072" rx="1.91504" transform="rotate(-135 32.5596 32.2593)" fill="white"/>
<rect x="25.9453" y="14.3789" width="3.56445" height="20.0728" rx="1.78223" transform="rotate(17.9532 25.9453 14.3789)" fill="white"/>
</svg>`

function init(){
    Modal.listener.follow('toggle', (e)=>{
        open_about = e.active.about

        if(e.active.about){
            e.html.find('.modal__body').on('click', (e)=>{
                if(DeviceInput.canClick(e.originalEvent)) press()
            })
        }
    })

    Modal.listener.follow('preshow,close', (e)=>{
        open_about   = false
        press_button = 0
    })

    Keypad.listener.follow('enter', press)

    Storage.listener.follow('change', (e)=>{
        if(e.name == 'developer_nodemo') Storage.set('remove_white_and_demo', e.value, true)
    })

    if(Storage.get('developer_enabled', 'false')) activate()
}

function press(){
    if(!open_about || window.lampa_settings.developer.enabled) return

    press_button++

    if(press_button == 10){
        Bell.push({text: Lang.translate('developer_trigger_help_1'), icon})
    }
    else if(press_button == 20){
        Bell.push({text: Lang.translate('developer_trigger_help_2'), icon})
    }
    else if(press_button == 30){
        Bell.push({text: Lang.translate('developer_trigger_help_3'), icon})
    }
    else if(press_button == 40){
        Storage.set('developer_enabled', 'true')

        activate()

        Bell.push({text: Lang.translate('developer_trigger_help_4'), icon})
    }
}

function params(){
    let component = 'developer'

    Settings.addComponent({
        component,
        icon,
        name: Lang.translate('title_developer'),
    })

    let display = Arrays.clone(buttons)

    if(!Account.hasPremium()){
        Arrays.remove(display, 'ads')
    }

    display.forEach(name=>{
        Lampa.SettingsApi.addParam({
            component,
            param: {
                name: 'developer_' + name,
                type: 'trigger',
                default: false
            },
            field: {
                name: Lampa.Lang.translate('developer_param_' + name),
            },
            onChange: (e)=>{
                window.lampa_settings.developer[name] = Storage.get('developer_' + name, 'false')
            }
        })
    })

    let values = {}

    Manifest.cub_mirrors.forEach(domain=>{
        values[domain] = domain
    })

    Lampa.SettingsApi.addParam({
        component,
        param: {
            name: 'cub_domain',
            type: 'select',
            values,
            default: Manifest.cub_domain
        },
        field: {
            name: Lampa.Lang.translate('settings_cub_domain'),
        }
    })
}

function activate(){
    buttons.forEach(name=>{
        window.lampa_settings.developer[name] = Storage.get('developer_' + name, 'false')
    })

    Settings.removeComponent('developer')

    if(window.lampa_settings.developer.enabled) params()
}

export default {
    init
}