import Settings from '../components/settings'
import SettingsApi from '../components/settings/api'
import Params from '../components/settings/params'
import Template from './template'
import Storage from '../utils/storage'
import Input from '../components/settings/input'
import Controller from './controller'
import Noty from './noty'
import Lang from '../utils/lang'

let already_requested   = false
let last_time_requested = 0

function init(){
    Params.trigger('parental_control', false)

    Params.select('parental_control_time',{
        'always': '#{settings_parental_control_param_time_always}',
        'once': '#{settings_parental_control_param_time_once}',
        '10': '#{settings_parental_control_param_time_10}',
        '20': '#{settings_parental_control_param_time_20}',
        '30': '#{settings_parental_control_param_time_30}',
        '60': '#{settings_parental_control_param_time_60}',
        '120': '#{settings_parental_control_param_time_120}'
    },'once')

    SettingsApi.addComponent({
        component: 'parental_control',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="512" height="512" viewBox="0 0 401.998 401.998" xml:space="preserve"><path d="M357.45 190.721c-5.331-5.33-11.8-7.993-19.417-7.993h-9.131v-54.821c0-35.022-12.559-65.093-37.685-90.218C266.093 12.563 236.025 0 200.998 0c-35.026 0-65.1 12.563-90.222 37.688-25.126 25.126-37.685 55.196-37.685 90.219v54.821h-9.135c-7.611 0-14.084 2.663-19.414 7.993-5.33 5.326-7.994 11.799-7.994 19.417V374.59c0 7.611 2.665 14.086 7.994 19.417 5.33 5.325 11.803 7.991 19.414 7.991H338.04c7.617 0 14.085-2.663 19.417-7.991 5.325-5.331 7.994-11.806 7.994-19.417V210.135c.004-7.612-2.669-14.084-8.001-19.414zm-83.363-7.993H127.909v-54.821c0-20.175 7.139-37.402 21.414-51.675 14.277-14.275 31.501-21.411 51.678-21.411 20.179 0 37.399 7.135 51.677 21.411 14.271 14.272 21.409 31.5 21.409 51.675v54.821z" fill="white"></path></svg>`,
        name: Lang.translate('title_parental_control')
    })

    Template.add('settings_parental_control',`<div>
        <div class="settings-param selector parental-control-toggle" data-type="button" data-static="true">
            <div class="settings-param__name">#{title_parental_control}</div>
            <div class="settings-param__value"></div>
        </div>
        <div class="parental-control-other">
            <div class="settings-param selector settings-param--button parental-control-change" data-type="button" data-static="true">
                <div class="settings-param__name">#{settings_parental_control_change_pin}</div>
            </div>
            <div class="settings-param selector" data-type="select" data-name="parental_control_time">
                <div class="settings-param__name">#{settings_parental_control_demand_title}</div>
                <div class="settings-param__value"></div>
                <div class="settings-param__descr">#{settings_parental_control_demand_descr}</div>
            </div>
        </div>
    </div>`)

    Settings.listener.follow('open', function (e) {
        if(e.name == 'parental_control'){
            let toggle = e.body.find('.parental-control-toggle')
            let change = e.body.find('.parental-control-change')
            let other  = e.body.find('.parental-control-other')
            let active
                
            let updateStatus = ()=>{
                toggle.find('.settings-param__value').text(Lang.translate(Storage.field('parental_control') ? 'settings_parental_control_enabled' : 'settings_parental_control_disabled'))

                other.toggleClass('hide', !Boolean(Storage.field('parental_control')))
            }

            toggle.on('hover:enter',()=>{
                active = Controller.enabled().name

                if(Storage.field('parental_control')){
                    request(()=>{
                        Storage.set('parental_control', false)

                        updateStatus()

                        Controller.toggle(active)
                    }, ()=>{
                        Controller.toggle(active)
                    })
                }
                else if(!Storage.value('parental_control_pin')){
                    set((code)=>{
                        if(code){
                            Storage.set('parental_control_pin', code)
                            Storage.set('parental_control', true)

                            updateStatus()
                        }
                    })
                }
                else{
                    Storage.set('parental_control', true)

                    updateStatus()
                }
            })

            change.on('hover:enter',()=>{
                active = Controller.enabled().name

                if(Storage.value('parental_control_pin')){
                    request(()=>{
                        set((code)=>{
                            if(code){
                                Storage.set('parental_control_pin', code)
                            }

                            Controller.toggle(active)
                        })
                    }, ()=>{
                        Controller.toggle(active)
                    })
                }
            })

            updateStatus()
        }
    })
}

function set(call){
    let active = Controller.enabled().name

    pin(Lang.translate('parental_control_input_new_code'),(code_one)=>{
        if(code_one){
            pin(Lang.translate('parental_control_confirm_new_code'),(code_two)=>{
                if(code_one == code_two){
                    Controller.toggle(active)

                    call(code_two)
                }
                else{
                    Controller.toggle(active)

                    Noty.show(Lang.translate('parental_control_no_match_code'))

                    call()
                }
            })
        }
        else{
            Controller.toggle(active)

            call()
        }
    })
}

function pin(title, call){
    Input.edit({
        free: true,
        title: title,
        nosave: true,
        value: '',
        layout: 'nums',
        keyboard: 'lampa'
    },call)
}

function request(call, error){
    if(Storage.field('parental_control')){
        pin(Lang.translate('parental_control_input_code'),(code)=>{
            if(code == Storage.value('parental_control_pin')){
                call()
            }
            else if(code){
                Noty.show(Lang.translate('parental_control_input_error'))

                if(error) error()
            }
            else if(error) error()
        })
    }
    else{
        call()
    }
}

/**
 * Запросить PIN-код
 * @param {function} call - если pin верный
 * @param {function} error - если нет
 */
function query(call, error){
    if(Storage.field('parental_control')){
        let type = Storage.field('parental_control_time')

        if(type !== 'always'){
            if(type == 'once'){
                if(already_requested) return call()
            }
            else{
                if(last_time_requested + 1000 * 60 * parseInt(type) > Date.now()) return call()
            }
        }

        request(()=>{
            already_requested   = true
            last_time_requested = Date.now()

            call()
        }, error)
    }
    else{
        call()
    }
}

/**
 * Запрос на установку PIN-кода, перед этим нужно проверить через enabled()
 * @param {function} call - callback
 */
function install(call){
    set((code)=>{
        if(code){
            Storage.set('parental_control_pin', code)
            Storage.set('parental_control', true)
        }

        call(Boolean(code))
    })
}

/**
 * Проверить, установлен ли контроль
 * @returns bollean
 */
function enabled(){
    return Storage.field('parental_control')
}

export default {
    init,
    query,
    enabled,
    install
}