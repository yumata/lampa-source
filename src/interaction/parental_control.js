import Settings from '../components/settings'
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
        keyboard: 'lampa',
        password: true
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