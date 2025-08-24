import Utils from '../../utils/utils'
import Storage from '../storage/storage'
import Settings from '../../interaction/settings/settings'
import Reguest from '../../utils/reguest'
import Select from '../../interaction/select'
import Noty from '../../interaction/noty'
import Controller from '../controller'
import Favorite from '../favorite'
import Arrays from '../../utils/arrays'
import Socket from '../socket'
import Lang from '../lang'
import Subscribe from '../../utils/subscribe'
import Modal from '../../interaction/modal'
import Template from '../../interaction/template'
import Head from '../../interaction/head/head'
import Loading from '../../interaction/loading'
import Manifest from '../manifest'
import Input from '../../interaction/settings/input'
import ParentalControl from '../../interaction/parental_control'
import Platform from '../platform'
import Timeline from './timeline'
import Statistic from './statistic'
import Bookmarks from './bookmarks'
import Listener from './listener'
import Permit from './permit'
import Profile from './profile'
import Backup from './backup'
import Panel from './panel'
import Device from './device'

let network   = new Reguest()
let user_data

let notice_load = {
    time: 0,
    data: []
}

function api(){
    return Utils.protocol() + Manifest.cub_domain + '/api/'
}

/**
 * Запуск
 */
function init(){
    if(!window.lampa_settings.account_use) return

    Statistic.init()
    Timeline.init()
    Bookmarks.init()
    Profile.init()
    Panel.init()
    Device.init()

    Storage.listener.follow('change',(e)=>{
        if(e.name == 'cub_domain'){
            Noty.show(Lang.translate('account_reload_after'))

            setTimeout(()=>{
                window.location.reload()
            }, 5000)
        }
    })

    Socket.listener.follow('open',checkValidAccount)

    if(!window.lampa_settings.disable_features.dmca){
        network.silent(Utils.protocol() + 'tmdb.'+Manifest.cub_domain+'/blocked',(dcma)=>{
            window.lampa_settings.dcma = dcma
        })
    }

    setInterval(checkValidAccount, 1000 * 60 * 10)

    notice_load.data = Storage.get('account_notice','[]')

    Profile.check(()=>{
        getUser()

        Timeline.update()

        Profile.update()

        persons()
    })

    ParentalControl.add('account_profiles',{
        title: 'account_profiles'
    })
}

function task(call){
    if(!window.lampa_settings.account_use) return call()

    Bookmarks.update(call)
}


function checkValidAccount(){
    let account = Storage.get('account','{}')

    if(account.token){
        Socket.send('check_token',{})
    }
}

function persons(secuses, error){
    let account = Storage.get('account','{}')

    if(account.token && window.lampa_settings.account_use && !window.lampa_settings.disable_features.persons){
        network.silent(api() + 'person/list',(data)=>{
            Storage.set('person_subscribes_id',data.results.map(a=>a.person_id))

            if(secuses) secuses(data.results)
        },error ? error : false,false,{
            headers: {
                token: account.token
            }
        })
    }
    else if(error) error()
}

function getUser(){
    let account = Storage.get('account','{}')

    if(account.token && window.lampa_settings.account_use){
        network.silent(api() + 'users/get',(result)=>{
            user_data = result.user

            Storage.set('account_user',JSON.stringify(result.user))
        },false,false,{
            headers: {
                token: account.token
            }
        })
    }
}

function checkPremium(){
    let user = user_data || Storage.get('account_user','{}')

    return user.id ? Utils.countDays(Date.now(), user.premium) : 0
}

function plugins(call){
    let account = Storage.get('account','{}')

    if(account.token && window.lampa_settings.account_use){
        network.timeout(3000)
        network.silent(api() + 'plugins/all',(result)=>{
            if(result.secuses){
                Storage.set('account_plugins',result.plugins)

                call(result.plugins)
            }
            else{
                call(Storage.get('account_plugins','[]'))
            }
        },()=>{
            call(Storage.get('account_plugins','[]'))
        },false,{
            headers: {
                token: account.token,
                profile: account.profile.id
            }
        })
    }
    else{
        call([])
    }
}

function extensions(call){
    let account = Storage.get('account','{}')

    let headers = {}

    if(account.token && window.lampa_settings.account_use){
        headers = {
            headers: {
                token: account.token,
                profile: account.profile.id
            }
        }
    }
    
    network.timeout(5000)
    network.silent(api() + 'extensions/list',(result)=>{
        if(result.secuses){
            if(window.lampa_settings.white_use){
                let forbidden = [
                    9,
                    10,
                    12,
                    180,
                    5,
                    149,
                    13,
                    158,
                    179,
                ]

                result.results.forEach(elem => {
                    elem.results = elem.results.filter(plug=>forbidden.indexOf(plug.id) == -1)
                })
            }

            Storage.set('account_extensions',result)

            call(result)
        }
        else{
            call(Storage.get('account_extensions','{}'))
        }
    },()=>{
        call(Storage.get('account_extensions','{}'))
    },false,headers)
    
}

function pluginsStatus(plugin, status){
    let account = Storage.get('account','{}')

    if(account.token && window.lampa_settings.account_use){
        network.silent(api() + (plugin.author ? 'extensions' : 'plugins') + '/status',false,false,{
            id: plugin.id,
            status: status
        },{
            headers: {
                token: account.token,
                profile: account.profile.id
            }
        })
    }
}

function working(){
    return Permit.sync
}

function canSync(logged_check){
    return (logged_check ? logged() && window.lampa_settings.account_sync : working()) ? Permit.account : false
}

function workingAccount(){
    return Permit.sync ? Permit.account : false
}

function logged(){
    return Permit.account.token ? window.lampa_settings.account_use : false
}

function addDiscuss(params, call){
    let account = Storage.get('account','{}')

    if(account.token){
        network.silent(api() + 'discuss/add',(data)=>{
            data.result.icon = account.profile.icon
            
            call(data.result)
        },(j,e)=>{
            Noty.show(network.errorJSON(j).text || Lang.translate('network_500'), {time: 5000})
        },{
            id: [params.method, params.id].join('_'),
            comment: params.comment,
            lang: Storage.field('language')
        },{
            headers: {
                token: account.token,
                profile: account.profile.id
            }
        })
    }
}

function voiteDiscuss(params, call){
    let account = Storage.get('account','{}')

    if(account.token){
        network.silent(api() + 'discuss/voite',call,(j,e)=>{
            Noty.show(network.errorJSON(j).text || Lang.translate('network_500'))
        },params,{
            headers: {
                token: account.token,
                profile: account.profile.id
            }
        })
    }
}

function notice(call){
    let account = Storage.get('account','{}')

    if(account.token && window.lampa_settings.account_use && window.lampa_settings.account_sync){
        if(notice_load.time + 1000*60*10 < Date.now()){
            network.timeout(5000)

            network.silent(api() + 'notice/all',(result)=>{
                if(result.secuses){
                    notice_load.time = Date.now()
                    notice_load.data = result.notice

                    Storage.set('account_notice',result.notice.map(n=>n))

                    call(result.notice)
                }
                else call(notice_load.data)
            },()=>{
                call(notice_load.data)
            },false,{
                headers: {
                    token: account.token,
                    profile: account.profile.id
                }
            })
        }
        else call(notice_load.data)
    }
    else call([])
}

function subscribes(params, secuses, error){
    let account = canSync(true)

    if(account){
        network.silent(api() + 'notifications/all',(result)=>{
            secuses({
                results: result.notifications.map(r=> Arrays.decodeJson(r.card,{}))
            })
        },error,false,{
            headers: {
                token: account.token,
                profile: account.profile.id
            }
        })
    }
    else error()
}

function showModal(template_name){
    let enabled = Controller.enabled().name

    Modal.open({
        title: '',
        html: Template.get(template_name),
        onBack: ()=>{
            Modal.close()

            Controller.toggle(enabled)
        }
    })
}

function showNoAccount(){
    showModal('account')
}

function showLimitedAccount(){
    showModal('account_limited')
}

function showCubPremium(){
    let enabled = Controller.enabled().name

    Modal.open({
        title: '',
        html: Template.get('cub_premium'),
        onBack: ()=>{
            Modal.close()

            Controller.toggle(enabled)
        }
    })

    Modal.render().addClass('modal--cub-premium').find('.modal__content').before('<div class="modal__icon"><svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 32 32"><path d="m2.837 20.977q-.912-5.931-1.825-11.862a.99.99 0 0 1 1.572-.942l5.686 4.264a1.358 1.358 0 0 0 1.945-.333l4.734-7.104a1.263 1.263 0 0 1 2.1 0l4.734 7.1a1.358 1.358 0 0 0 1.945.333l5.686-4.264a.99.99 0 0 1 1.572.942q-.913 5.931-1.825 11.862z" fill="#D8C39A"></svg></div>')
}

function subscribeToTranslation(params = {}, call, error){
    let account = canSync(true)

    if(account && params.voice){
        network.timeout(5000)

        network.silent(api() + 'notifications/add',(result)=>{
            if(result.limited) showLimitedAccount()
            else if(call) call()
        },()=>{
            if(error) error()
        },{
            voice: params.voice,
            data: JSON.stringify(params.card),
            episode: params.episode,
            season: params.season
        },{
            headers: {
                token: account.token
            }
        })
    }
    else if(error) error()
}

function logoff(data){
    let account = Storage.get('account','{}')

    if(account.token && account.email == data.email){
        Storage.set('account','',true)
        Storage.set('account_use',false,true)
        Storage.set('account_user','',true)
        Storage.set('account_email','',true)
        Storage.set('account_notice','',true)
        Storage.set('account_bookmarks','',true)

        $('.head .open--profile').addClass('hide')

        window.location.reload()
    }
}

function test(call){
    let account = Storage.get('account','{}')

    console.log('Account','start test')

    if(account.token && window.lampa_settings.account_use && window.lampa_settings.account_sync){
        network.silent(api() + 'bookmarks/all?full=1',(result)=>{
            console.log('Account', 'test bookmarks:', Utils.shortText(result, 300))

            if(call) call()
        },()=>{
            console.log('Account', 'test bookmarks: error')

            if(call) call()
        },false,{
            dataType: 'text',
            timeout: 8000,
            headers: {
                token: account.token,
                profile: account.profile.id
            }
        })
    }
    else{
        console.log('Account', 'test bookmarks: no sync')

        if(call) call()
    }
}

let Account = {
    listener: Listener,
    init,
    task,
    working,
    canSync,
    workingAccount,
    get: Bookmarks.get,
    all: Bookmarks.all,
    plugins,
    notice,
    pluginsStatus,
    showProfiles: Profile.select,
    clear: Bookmarks.clear,
    update: Bookmarks.update,
    network,
    backup: ()=>{}, //устарело
    extensions,
    subscribeToTranslation,
    subscribes,
    showNoAccount,
    showCubPremium,
    showLimitedAccount,
    logged,
    removeStorage: ()=>{}, //устарело
    logoff,
    persons,
    addDiscuss,
    voiteDiscuss,
    updateUser: ()=>{
        getUser()
    },
    test
}

Object.defineProperty(Account, 'hasPremium', {
    value: function() {
       return checkPremium()
    },
    writable: false
})

export default Account