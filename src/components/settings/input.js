import Template from '../../interaction/template'
import Keybord from '../../interaction/keyboard'
import Controller from '../../interaction/controller'
import Select from '../../interaction/select'
import Storage from '../../utils/storage'
import Arrays from '../../utils/arrays'
import Noty from '../../interaction/noty'
import Helper from '../../interaction/helper'
import Lang from '../../utils/lang'
import Utils from '../../utils/math'

let html,keyboard,input,input_value = ''

/**
 * Заустить редактор
 * @param {{title:string, value:string, free:boolean, nosave:boolean}} params 
 * @param {function} call 
 */
function edit(params, call){
    html = Template.get('settings_input')

    input = html.find('.settings-input__input')

    let lamp = Storage.field('keyboard_type') == 'lampa' || params.keyboard == 'lampa'

    if(!lamp) input.hide()

    $('body').addClass('keyboard-input--visible').append(html)

    let pass = (v)=>{
        return params.password ? v.replace(/./g,'*') : v
    }

    keyboard = new Keybord(params)

    keyboard.listener.follow('change',(event)=>{
        input_value = event.value.trim()

        input.toggleClass('filled', Boolean(event.value))

        input.html(pass(Utils.inputDisplay(event.value)))
    })

    keyboard.listener.follow('enter',(event)=>{
        back()

        call(input_value)
    })

    keyboard.listener.follow('focus',(event)=>{
        html.toggleClass('settings-input--focus', true)
    })

    keyboard.listener.follow('blur',(event)=>{
        html.toggleClass('settings-input--focus', false)
    })

    html.toggleClass('settings-input--free',params.free ? true : false)

    $('.settings-input__links', html).toggleClass('hide', params.nosave ? true : false)

    if(params.title) html.find('.settings-input__content').prepend('<div class="settings-input__title">'+params.title+'</div>')
    
    keyboard.listener.follow('down',(event)=>{
        if(params.nosave) return

        let members = Storage.get('setting_member',[])
        let links   = []

        links.push({
            title: (members.indexOf(input_value) == -1 ? Lang.translate('settings_add') : Lang.translate('settings_remove')) + ' ' + Lang.translate('settings_this_value'),
            subtitle: input_value,
            add: true
        })

        members.forEach(link => {
            links.push({
                title: link,
                subtitle: Lang.translate('settings_user_links'),
                url: link,
                member: true
            })
        })

        links = links.concat([
            {
                title: '127.0.0.1:8090',
                subtitle: Lang.translate('settings_for_local'),
                url: '127.0.0.1:8090'
            }
        ])

        Select.show({
            title: Lang.translate('title_links'),
            items: links,
            onSelect: (a)=>{
                if(a.add){
                    if(members.indexOf(a.subtitle) == -1){
                        Arrays.insert(members,0,a.subtitle)

                        Noty.show(Lang.translate('settings_added') + ' ('+a.subtitle+')')
                    }
                    else{
                        Arrays.remove(members, a.subtitle)

                        Noty.show(Lang.translate('settings_removed') + ' ('+a.subtitle+')')
                    }

                    Storage.set('setting_member',members)
                }
                else{
                    keyboard.value(a.url)
                }

                keyboard.toggle()
            },
            onLong: (a, elem)=>{
                if(a.member){
                    Arrays.remove(members, a.url)

                    Noty.show(Lang.translate('settings_removed') + ' ('+a.url+')')

                    Storage.set('setting_member',members)

                    $(elem).css({opacity: 0.4})
                }
            },
            onBack: ()=>{
                keyboard.toggle()
            }
        })
    })

    keyboard.listener.follow('back',()=>{
        back()

        call(input_value)
    })

    keyboard.create()

    keyboard.value(params.value)

    keyboard.toggle()

    input_value = params.value

    Helper.show('keyboard',Lang.translate('helper_keyboard'))

    return keyboard
}

/**
 * Назад
 */
function back(){
    destroy()

    Controller.toggle('settings_component')
}

/**
 * Уничтожить
 */
function destroy(){
    keyboard.destroy()

    html.remove()

    $('body').removeClass('keyboard-input--visible')

    html = null
    keyboard = null
    input = null
}

export default {
    edit
}