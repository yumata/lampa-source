import Utils from '../../utils/utils'
import Storage from '../storage/storage'
import Reguest from '../../utils/reguest'
import Socket from '../socket'
import Timeline from './timeline'
import Bookmarks from './bookmarks'
import Listener from './listener'
import Permit from './permit'
import Profile from './profile'
import Panel from './panel'
import Device from './device'
import Api from './api'
import Modal from './modal'
import Timer from '../timer'

let network = new Reguest()
let user_data


/**
 * Запуск
 */
function init(){
    if(!window.lampa_settings.account_use) return

    console.log('Account','use', Permit.token ? Permit.account.email : 'no account')

    Timeline.init()
    Bookmarks.init()
    Profile.init()
    Panel.init()
    Device.init()

    Socket.listener.follow('open', checkAccountValidity)

    Timer.add(1000 * 60 * 10, checkAccountValidity)

    Profile.check(()=>{
        Api.user(user=>user_data = user)

        Timeline.update()

        Profile.update()

        Api.persons()
    })

    delete Account.init
}

/**
 * Задача загрузки приложения
 * @param {Function} call - функция обратного вызова
 * @return {void}
 */
function task(call){
    if(!window.lampa_settings.account_use) return call()

    Bookmarks.update(call)
}

/**
 * Проверить валидность аккаунта
 * @return {void}
 */
function checkAccountValidity(){
    Permit.token && Socket.send('check_token',{})
}

/**
 * Выход из аккаунта
 * @param {Object} data - данные аккаунта
 * @return {void}
 */
function logoff(data){
    let account = Permit.account

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


let Account = {
    Api,
    Bookmarks,
    Profile,
    Timeline,
    Permit,
    Modal,

    listener: Listener,
    network,

    init,
    task,
    working: ()=>{
        console.warn('Account.working() is deprecated, use Account.Permit.sync')

        return Permit.sync
    },
    canSync: ()=>{
        console.warn('Account.canSync() is deprecated, use Account.Permit.sync ? Account.Permit.account : false')

        return Permit.sync ? Permit.account : false
    },
    workingAccount: ()=>{
        console.warn('Account.workingAccount() is deprecated, use Account.Permit.sync ? Account.Permit.account : false')

        return Permit.sync ? Permit.account : false
    },
    logged: ()=>{
        console.warn('Account.logged() is deprecated, use Permit.access')

        return Permit.access
    },
    get: (params)=>{
        console.warn('Account.get() is deprecated, use Account.Bookmarks.get()')

        return Bookmarks.get(params)
    },
    all: ()=>{
        console.warn('Account.all() is deprecated, use Account.Bookmarks.all()')

        return Bookmarks.all()
    },
    plugins: (call)=>{
        console.warn('Account.plugins() is deprecated, use Account.Api.plugins()')

        Api.plugins(call)
    },
    notice: (call)=>{
        console.warn('Account.notice() is deprecated, use Account.Api.notices()')

        Api.notices(call)
    },
    pluginsStatus: (plugin, status)=>{
        console.warn('Account.pluginsStatus() is deprecated, use Account.Api.pluginToggle()')

        Api.pluginToggle(plugin, status)
    },
    showProfiles: (callback)=>{
        console.warn('Account.showProfiles() is deprecated, use Account.Profile.select()')

        Profile.select(callback)
    },
    clear: (where)=>{
        console.warn('Account.clear() is deprecated, use Account.Bookmarks.clear()')

        Bookmarks.clear(where)
    },
    update: (call)=>{
        console.warn('Account.update() is deprecated, use Account.Bookmarks.update()')

        Bookmarks.update(call)
    },
    backup: ()=>{
        console.warn('Account.backup() is deprecated')
    },
    subscribeToTranslation: (params, call, error)=>{
        console.warn('Account.subscribeToTranslation() is deprecated, use Account.Api.subscribeToTranslation()')

        Api.subscribeToTranslation(params, call, error)
    },
    subscribes: (params, secuses, error)=>{
        console.warn('Account.subscribes() is deprecated, use Account.Api.subscribes()')

        Api.subscribes(params, secuses, error)
    },
    showNoAccount: ()=>{
        console.warn('Account.showNoAccount() is deprecated, use Account.Modal.account()')

        Modal.account()
    },
    showCubPremium: ()=>{
        console.warn('Account.showCubPremium() is deprecated, use Account.Modal.premium()')

        Modal.premium()
    },
    showLimitedAccount: ()=>{
        console.warn('Account.showLimitedAccount() is deprecated, use Account.Modal.limited()')

        Modal.limited()
    },
    logoff,
    persons: ()=>{
        console.warn('Account.persons() is deprecated, use Account.Api.persons()')

        Api.persons()
    },
    updateUser: ()=>{
        Api.user(user=>user_data = user)
    }
}

Object.defineProperty(Account, 'hasPremium', {
    value: function() {
        let user = user_data || Storage.get('account_user','{}')

        if(Storage.get('developer_nopremium', 'false')) return 0

        return user.id ? Utils.countDays(Date.now(), user.premium) : 0
    },
    writable: false
})

export default Account