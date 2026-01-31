import Settings from './settings/settings'
import Params from './settings/params'
import Template from './template'
import Storage from '../core/storage/storage'
import Input from './settings/input'
import Controller from '../core/controller'
import Noty from './noty'
import Lang from '../core/lang'
import Platform from '../core/platform'
import Arrays from '../utils/arrays'
import HeadBackward from './head/backward'
import Permit from '../core/account/permit'

let already_requested   = false
let last_time_requested = 0

let personal_codes = {}

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
            <div class="parental-control-personal">
                <div class="settings-param-title"><span>#{settings_parental_control_where}</span></div>
                <div class="parental-control-personal-list"></div>
            </div>
        </div>
    </div>`)

    Settings.listener.follow('open', function (e) {
        if(e.name == 'parental_control'){
            let toggle = e.body.find('.parental-control-toggle')
            let change = e.body.find('.parental-control-change')
            let other  = e.body.find('.parental-control-other')
            let active

            // Нельзя изменить код если детский профиль
            if(Permit.child) change.remove()
                
            let updateStatus = ()=>{
                toggle.find('.settings-param__value').text(Lang.translate(enabled() ? 'settings_parental_control_enabled' : 'settings_parental_control_disabled'))

                other.toggleClass('hide', !Boolean(enabled()))
            }

            let drawPersonalList = ()=>{
                let enabled = Storage.get('parental_control_personal','[]')
                let list    = e.body.find('.parental-control-personal-list')

                let item = (name, data)=>{
                    let line = $(`<div class="selectbox-item selector selectbox-item--checkbox" data-type="button" data-static="true">
                        <div class="selectbox-item__title">${Lang.translate(data.title)}</div>
                        <div class="selectbox-item__checkbox"></div>
                    </div>`)

                    if(enabled.indexOf(name) >= 0) line.addClass('selectbox-item--checked')

                    line.on('hover:enter',()=>{
                        active = Controller.enabled().name

                        query(()=>{
                            enabled = Storage.get('parental_control_personal','[]')

                            if(enabled.indexOf(name) >= 0){
                                Arrays.remove(enabled, name)

                                Storage.set('parental_control_personal',enabled)

                                line.removeClass('selectbox-item--checked')
                            }
                            else{
                                Storage.add('parental_control_personal',name)

                                line.addClass('selectbox-item--checked')
                            }
    
                            Controller.toggle(active)
                        }, ()=>{
                            Controller.toggle(active)
                        })
                    })

                    list.append(line)
                }

                for(let name in personal_codes) item(name, personal_codes[name])

                Params.listener.send('update_scroll')
            }

            toggle.on('hover:enter',()=>{
                active = Controller.enabled().name

                if(enabled()){
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
            drawPersonalList()
        }
    })

    add('bookmarks',{
        title: 'settings_input_links'
    })
}

/**
 * Запрос на установку PIN-кода
 * @param {function} call - вызов
 */
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

/**
 * Показать экран ввода пина
 * @param {string} title - заголовок
 * @param {function} call - вызов
 */
function pin(title, call){
    let input = ''

    let html_layer = $(`<div class="pincode">
        <div class="pincode__container">
            <div class="pincode__title">${title}</div>
        </div>
    </div>`)

    let html_code = $(`<div class="pincode__code">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
    </div>`)

    let drawPin = ()=>{
        let div = html_code.find('div').removeClass('fill')

        for(let i = 0; i < 4; i++){
            if(input[i]) div.eq(i).addClass('fill')
        }
    }

    let removeNum = ()=>{
        input = input.slice(0, Math.max(0,input.length - 1))

        drawPin()

        if(!input) callClose()
    }

    let callClose = ()=>{
        html_layer.remove()

        call(input)
    }

    if(Platform.tv()){
        let html_body = $(`<div class="pincode__body">
            <div class="pincode__left">
                <div class="pincode__text">
                    ${Lang.translate('pincode_use_remote')}
                </div>
                <div class="pincode__text">
                    ${Lang.translate('pincode_use_toggle')}
                </div>
            </div>
            <div class="pincode__right">
                <div class="pincode-remote">
                    <div class="pincode-remote__light"></div>
                    <div class="pincode-remote__circle">
                        <svg width="77" height="77" viewBox="0 0 77 77" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="38.5" cy="38.5" r="38.5" fill="#666666"/>
                            <circle cx="38.5" cy="38.5" r="18.5" fill="#2E2E2E"/>
                            <circle cx="38.5" cy="38.5" r="15.5" fill="#666666"/>
                            <path d="M13.8977 12.6906L23.7972 22.5901L23.0901 23.2972L13.1906 13.3977L13.8977 12.6906Z" fill="#020202" fill-opacity="0.14"/>
                            <path d="M54.9099 53.7028L64.8094 63.6023L64.1023 64.3094L54.2028 54.4099L54.9099 53.7028Z" fill="#020202" fill-opacity="0.14"/>
                            <path d="M13.1906 63.6023L23.0901 53.7028L23.7972 54.4099L13.8977 64.3094L13.1906 63.6023Z" fill="#020202" fill-opacity="0.14"/>
                            <path d="M54.2028 22.5901L64.1023 12.6906L64.8094 13.3977L54.9099 23.2972L54.2028 22.5901Z" fill="#020202" fill-opacity="0.14"/>
                        </svg>
                        <div class="pincode-remote__circle-pulse"></div>
                        <div class="pincode-remote__nums">
                            <div class="pincode-remote__num-top"><span>1</span></div>
                            <div class="pincode-remote__circle-center">
                                <div class="pincode-remote__num-left"><span>4</span></div>
                                <div class="pincode-remote__num-center"><span>0</span></div>
                                <div class="pincode-remote__num-right"><span>2</span></div>
                            </div>
                            <div class="pincode-remote__num-bottom"><span>3</span></div>
                        </div>
                    </div>

                    <div class="pincode-remote__remove">
                        <div class="pincode-remote__remove-icon">
                            <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="6.5" cy="6.5" r="6" stroke="white" stroke-opacity="0.21"/>
                                <rect x="4.2952" y="6.49226" width="4.45542" height="1.2899" rx="0.644948" transform="rotate(-45 4.2952 6.49226)" fill="#D9D9D9"/>
                                <rect width="4.45542" height="1.29877" rx="0.649387" transform="matrix(0.707107 0.707107 0.707107 -0.707107 4.2952 6.50774)" fill="#D9D9D9"/>
                            </svg>
                        </div>
                        <div class="pincode-remote__remove-text">${Lang.translate('settings_remove')}</div>
                    </div>
                </div>
            </div>
        </div>`)

        html_body.find('.pincode__left').prepend(html_code)
        html_layer.find('.pincode__container').append(html_body)

        let layout_active = 0
        let layout_keys   = [
            [1,2,3,4,'0'],
            [5,6,7,8,9]
        ]

        let drawLayout = ()=>{
            let keys = layout_keys[layout_active]

            html_body.find('.pincode-remote__num-top span').text(keys[0])
            html_body.find('.pincode-remote__num-right span').text(keys[1])
            html_body.find('.pincode-remote__num-bottom span').text(keys[2])
            html_body.find('.pincode-remote__num-left span').text(keys[3])
            html_body.find('.pincode-remote__num-center span').text(keys[4])
        }

        let animate = ()=>{
            let elem = html_body.find('.pincode-remote').removeClass('push')
                
            setTimeout(()=>{
                elem.addClass('push')
            },60)
        }

        let writeNum = (key)=>{
            input = input + layout_keys[layout_active][key]

            drawPin()

            if(input.length == 4) callClose()
            else animate()
        }

        drawLayout()

        Controller.add('parental_controll',{
            toggle: ()=>{
                Controller.clear()
            },
            long: ()=>{
                layout_active++

                if(layout_active >= layout_keys.length) layout_active = 0

                drawLayout()
            },
            enter: ()=>{
                writeNum(4)
            },
            left: ()=>{
                writeNum(3)
            },
            up: ()=>{
                writeNum(0)
            },
            down: ()=>{
                writeNum(2)
            },
            right: ()=>{
                writeNum(1)
            },
            back: ()=>{
                removeNum()
            },
        })
    
        Lampa.Controller.toggle('parental_controll')

        
    }
    else{
        html_layer.addClass('mobile')

        let html_keyboard = $(`<div class="pincode-keyboard">
            <div data-key="1" class="selector"><span>1</span></div>
            <div data-key="2" class="selector"><span>2</span></div>
            <div data-key="3" class="selector"><span>3</span></div>
            <div data-key="4" class="selector"><span>4</span></div>
            <div data-key="5" class="selector"><span>5</span></div>
            <div data-key="6" class="selector"><span>6</span></div>
            <div data-key="7" class="selector"><span>7</span></div>
            <div data-key="8" class="selector"><span>8</span></div>
            <div data-key="9" class="selector"><span>9</span></div>
            <div data-key="0" class="selector"><span>0</span></div>
            <div></div>
            <div class="remove selector">
                <svg width="139" height="105" viewBox="0 0 139 105" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M125.969 0.375122H47.5564C43.6325 0.375122 39.955 2.11446 37.4647 5.15569L0.979756 49.7513C-0.326911 51.3503 -0.326911 53.6496 0.979756 55.2486L37.469 99.8486C39.9546 102.886 43.6325 104.625 47.5564 104.625H125.969C133.155 104.625 139 98.7792 139 91.5936V13.4063C139 6.22026 133.155 0.375122 125.969 0.375122V0.375122ZM130.313 91.5936C130.313 93.9904 128.365 95.9372 125.969 95.9372H47.5564C46.2458 95.9372 45.0197 95.356 44.1925 94.3464L9.95578 52.4997L44.1881 10.6574C45.0197 9.64349 46.2454 9.06227 47.5564 9.06227H125.969C128.365 9.06227 130.312 11.0095 130.312 13.4058C130.313 13.4063 130.313 91.5936 130.313 91.5936V91.5936Z" fill="white"/>
                <path d="M96.8349 27.71L78.1873 46.3576L59.5397 27.71L53.3975 33.8522L72.0451 52.4998L53.3975 71.1474L59.5397 77.2897L78.1873 58.6421L96.8349 77.2897L102.977 71.1474L84.3296 52.4998L102.977 33.8522L96.8349 27.71Z" fill="white"/>
                </svg>
            </div>
        </div>`)

        html_keyboard.find('[data-key]').on('hover:enter',function(){
            input = input + $(this).data('key')
            
            drawPin()

            if(input.length == 4) callClose()
        })

        html_keyboard.find('.remove').on('hover:enter',removeNum)

        html_layer.find('.pincode__container').append(html_code).append(html_keyboard)

        Controller.add('parental_controll',{
            toggle: ()=>{
                Controller.collectionSet(html_keyboard)
                Controller.collectionFocus(false, html_keyboard)
            },
            back: ()=>{
                input = ''
                call('')
                callClose()
            },
            up: ()=>{
                Navigator.move('up')
            },
            down: ()=>{
                Navigator.move('down')
            },
            left: ()=>{
                Navigator.move('left')
            },
            right: ()=>{
                Navigator.move('right')
            },
        })
    
        Lampa.Controller.toggle('parental_controll')
    }

    if(Platform.mouse()){
        html_layer.prepend(HeadBackward(''))
    }

    $('body').append(html_layer)

    setTimeout(()=>{
        html_layer.addClass('animate')
    },100)
}

/**
 * Устаревший метод, но все еще используется,
 * если пароль состоит не из 4 цифр
 * @param {string} title
 * @param {function} call
 */
function pinFree(title, call){
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

/**
 * Запросить PIN-код для настроек
 * @param {string} title - заголовок
 * @param {function} call - вызов
 */
function request(call, error){
    if(enabled()){
        let called = getPinCode().length == 4 ? pin : pinFree

        called(Lang.translate('parental_control_input_code'),(code)=>{
            if(code == getPinCode()){
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
 * Запросить PIN-код (Обший)
 * @param {function} call - если pin верный
 * @param {function} error - если нет
 * @param {boolean} save_controller - переключить на прошлый контроллер
 */
function query(call, error, save_controller){
    if(enabled()){
        let type   = Storage.field('parental_control_time')
        let active = Controller.enabled().name

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

            if(save_controller) Controller.toggle(active)

            call()
        }, ()=>{
            if(save_controller) Controller.toggle(active)

            if(error) error()
        })
    }
    else{
        call()
    }
}

/**
 * Запросить PIN-код (Персональный)
 * @param {string} name - название модуля
 * @param {function} call - если pin верный
 * @param {function} error - если нет
 * @param {boolean} save_controller - переключить на прошлый контроллер
 */
function personal(name, call, error, save_controller){
    let enabled = Storage.get('parental_control_personal','[]')

    if(enabled.indexOf(name) !== -1) query(call, error, save_controller)
    else call()
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
 * Добавить персональный PIN-код для запроса
 * @param {string} name - название модуля
 * @param {object} data - данные
 */
function add(name, data){
    Arrays.extend(data, {
        title: Lang.translate('player_unknown'),
        default: false
    })

    if(data.default) Storage.add('parental_control_personal',name)

    personal_codes[name] = data
}

/**
 * Проверить, установлен ли контроль
 * @returns bollean
 */
function enabled(){
    return Storage.field('parental_control') || Permit.child
}

/**
 * Получить PIN-код
 * @returns string
 */
function getPinCode(){
    return Permit.child ? Permit.profile.pincode || '0000' : Storage.value('parental_control_pin')
}

export default {
    init,
    query,
    personal,
    enabled,
    install,
    add
}