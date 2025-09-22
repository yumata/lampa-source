import Permit from './permit'
import Api from './api'
import Arrays from '../../utils/arrays'
import Utils from '../../utils/utils'
import Listener from './listener'
import Storage from '../storage/storage'
import Template from '../../interaction/template'
import Head from '../../interaction/head/head'
import Manifest from '../manifest'
import ParentalControl from '../../interaction/parental_control'
import Controller from '../controller'
import Select from '../../interaction/select'
import Noty from '../../interaction/noty'
import Loading from '../../interaction/loading'
import Lang from '../lang'
import Advert from './modal'

let profile_icon

function init(){
    profile_icon = Template.elem('div', {class: 'head__action selector open--profile'})

    profile_icon.on('hover:enter', select.bind(null, Controller.toggle.bind(Controller, 'head')))

    Head.render().find('.full--screen').before(profile_icon)

    Storage.listener.follow('change',(e)=>{
        if(e.name == 'account' || e.name == 'protocol') update()
    })

    ParentalControl.add('account_profiles',{
        title: 'account_profiles'
    })

    if(!Permit.token) update()
}

/**
 * Обновляет иконку профиля
 * @returns {void}
 */
function update(){
    profile_icon.empty()

    if(Permit.token){
        profile_icon.append(Template.elem('img'))

        Utils.imgLoad(profile_icon.find('img'), Utils.protocol() + Manifest.cub_domain + '/img/profiles/' + (Permit.account.profile.icon || 'l_1') + '.png', ()=>{}, (img)=>{
            img.src = './img/img_load.svg'
        })
    }
    else{
        profile_icon.append(Template.js('icon_profile'))
    }
}

/**
 * Проверяет наличие профиля, если его нет - загружает
 * @param {function} call - вызывается если профиль есть
 * @returns {void}
 */
function check(call){
    if(Permit.access){
        let account = Permit.account

        if(account.profile.id) call()
        else{
            Api.load('profiles/all', {attempts: 3}).then((result)=>{
                let main = result.profiles.find(p=>p.main)

                if(main){
                    account.profile = main

                    Storage.set('account', account, true)
                }

                call()
            }).catch(call)
        }
    }
    else{
        Storage.set('account_user','', true)
    }
}

/**
 * Выбор профиля
 * @param {string} controller - контроллер, который был активен до открытия выбора профиля
 * @returns {void}
 */
function select(callback){
    ParentalControl.personal('account_profiles',()=>{
        if(!Permit.token) return Advert.account()

        let account = Permit.account

        Loading.start(()=>{
            Api.clear()

            Loading.stop()
        })

        Api.load('profiles/all').then((result)=>{
            Loading.stop()

            if(result.secuses){
                let items = Arrays.clone(result.profiles)
                let clone = Arrays.clone(result.profiles)

                items.reverse()
                clone.reverse()

                Select.show({
                    title: Lang.translate('account_profiles'),
                    items: items.map((elem, index)=>{
                        elem.title    = elem.name
                        elem.template = 'selectbox_icon'
                        elem.icon     = '<img src="' + Utils.protocol() + Manifest.cub_domain +'/img/profiles/'+elem.icon+'.png" />'
                        elem.index    = index

                        elem.selected = account.profile.id == elem.id

                        return elem
                    }),
                    onSelect: (a)=>{
                        account.profile = clone[a.index]

                        Storage.set('account', account)

                        callback && callback()

                        Listener.send('profile_select', {profile: account.profile})
                    },
                    onBack: callback
                })
            }
            else{
                Noty.show(result.text)

                callback && callback()
            }
        }).catch(()=>{
            Loading.stop()
            
            Noty.show(Lang.translate('account_profiles_empty'))
        })
    }, false, true)
}

export default {
    init,
    update,
    check,
    select
}