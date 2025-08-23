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
import WebWorker from '../../utils/worker/worker'
import Manifest from '../manifest'
import Input from '../../interaction/settings/input'
import ParentalControl from '../../interaction/parental_control'
import Platform from '../platform'
import Timeline from './timeline'
import Statistic from './statistic'
import Bookmarks from './bookmarks'
import Listener from './listener'
import Permit from './permit'

let body
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

    Settings.listener.follow('open',(e)=>{
        body = null

        if(e.name == 'account'){
            body = e.body

            renderPanel()

            check()
        }
    })

    Storage.listener.follow('change',(e)=>{
        if(e.name == 'account'){
            updateProfileIcon()
        }

        if(e.name == 'cub_domain'){
            Noty.show(Lang.translate('account_reload_after'))

            setTimeout(()=>{
                window.location.reload()
            }, 5000)
        }

        if(e.name == 'protocol'){
            updateProfileIcon()
        }
    })

    Socket.listener.follow('open',checkValidAccount)


    Head.render().find('.head__body .open--profile').on('hover:enter',()=>{
        showProfiles('head')
    })

    if(!window.lampa_settings.disable_features.dmca){
        network.silent(Utils.protocol() + 'tmdb.'+Manifest.cub_domain+'/blocked',(dcma)=>{
            window.lampa_settings.dcma = dcma
        })
    }

    setInterval(checkValidAccount, 1000 * 60 * 10)

    notice_load.data = Storage.get('account_notice','[]')

    checkProfile(()=>{
        getUser()

        Timeline.update()

        updateProfileIcon()

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

function checkProfile(call){
    let account = Storage.get('account','{}')

    if(account.token && window.lampa_settings.account_use){
        if(account.profile.id) call()
        else{
            network.silent(api() + 'profiles/all',(result)=>{
                let main = result.profiles.find(p=>p.main)

                if(main){
                    account.profile = main

                    Storage.set('account', account, true)
                }

                call()
            },()=>{
                setTimeout(checkProfile.bind(checkProfile,call),1000 * 60)
            },false,{
                headers: {
                    token: account.token
                },
                timeout: 5000
            })
        }
    }
    else{
        Storage.set('account_user','')
    }
}

function checkValidAccount(){
    let account = Storage.get('account','{}')

    if(account.token){
        Socket.send('check_token',{})
    }
}

function updateProfileIcon(){
    return
    let account = Storage.get('account','{}')
    let button  = Head.render().find('.head__body .open--profile').toggleClass('hide', !Boolean(account.token))

    if(account.token){
        let img = button.find('img')[0]

        img.onerror = ()=>{
            img.src = './img/img_load.svg'
        }

        img.src = Utils.protocol() + Manifest.cub_domain + '/img/profiles/' + (account.profile.icon || 'l_1') + '.png'
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

/**
 * Статус
 */
function renderStatus(name, value = ''){
    if(body){
        body.find('.settings--account-status .settings-param__value').text(name)
        body.find('.settings--account-status .settings-param__descr').text(value)
    }
}

function addDevice(){
    let displayModal = ()=>{
        let html = Template.get('account_add_device')

        Utils.imgLoad(html.find('img'), Utils.protocol() + Manifest.cub_domain+'/img/other/qr-add-device.png',()=>{
            html.addClass('loaded')
        })

        html.find('.simple-button').on('hover:enter',()=>{
            Modal.close()

            Input.edit({
                free: true,
                title: Lang.translate('account_code_enter'),
                nosave: true,
                value: '',
                layout: 'nums',
                keyboard: 'lampa',
            },(new_value)=>{
                let code = parseInt(new_value)

                if(new_value && new_value.length == 6 && !isNaN(code)){
                    Loading.start(()=>{
                        network.clear()
                
                        Loading.stop()
                    })
                
                    network.clear()

                    function login(error){
                        network.silent(api() + 'device/add',(result)=>{
                            Loading.stop()
    
                            Storage.set('account',result,true)
                            Storage.set('account_email',result.email,true)
                    
                            window.location.reload()
                        },error,{
                            code
                        })
                    }
                
                    login(()=>{
                        localStorage.setItem('protocol', window.location.protocol == 'https:' ? 'https' : 'http')

                        login((e)=>{
                            Loading.stop()

                            Noty.show(Lang.translate(network.errorCode(e) == 200 ? 'account_code_error' : 'network_noconnect' ))
                        })
                    })
                }
                else{
                    displayModal()

                    if(new_value) Noty.show(Lang.translate('account_code_wrong'))
                }
            })
        })

        Modal.open({
            title: '',
            html: html,
            size: 'small',
            onBack: ()=>{
                Modal.close()

                Controller.toggle('settings_component')
            }
        })
    }
    
    displayModal()
}

function renderPanel(){
    if(body){
        let account = Storage.get('account','{}')
        let signed  = account.token ? true : false

        if(!window.lampa_settings.account_sync){
            body.find('[data-name="account_use"]').remove()

            body.find('.settings--account-status').nextAll().remove()
        }
        
        body.find('.settings--account-signin').toggleClass('hide',signed)
        body.find('.settings--account-user').toggleClass('hide',!signed)
        body.find('.settings--account-premium').toggleClass('selectbox-item--checked',Boolean(checkPremium()))
        body.find('.settings-param__label').toggleClass('hide',!Boolean(checkPremium()))

        if(!checkPremium()){
            body.find('.selectbox-item').on('hover:enter',showCubPremium)
        }

        body.find('.settings--account-device-add').on('hover:enter',addDevice)

        if(account.token){
            body.find('.settings--account-user-info .settings-param__value').text(account.email)
            body.find('.settings--account-user-profile .settings-param__value').text(account.profile.name)

            body.find('.settings--account-user-out').on('hover:enter',()=>{
                Storage.set('account','')
                Storage.set('account_user','')
                Storage.set('account_email','')

                Settings.update()

                Bookmarks.update()
            })

            body.find('.settings--account-user-sync').on('hover:enter',()=>{
                account = Storage.get('account','{}')

                Select.show({
                    title: Lang.translate('settings_cub_sync'),
                    items: [
                        {
                            title: Lang.translate('confirm'),
                            subtitle: Lang.translate('account_sync_to_profile') + ' ('+account.profile.name+')',
                            confirm: true
                        },
                        {
                            title: Lang.translate('cancel')
                        }
                    ],
                    onSelect: (a)=>{
                        if(a.confirm){
                            let file

                            try{
                                file = new File([localStorage.getItem('favorite') || '{}'], "bookmarks.json", {
                                    type: "text/plain",
                                })
                            }
                            catch(e){}

                            if(!file){
                                try{
                                    file = new Blob([localStorage.getItem('favorite') || '{}'], {type: 'text/plain'})
                                    file.lastModifiedDate = new Date()
                                }
                                catch(e){
                                    Noty.show(Lang.translate('account_export_fail'))
                                }
                            }

                            if(file){
                                let formData = new FormData($('<form></form>')[0])
                                    formData.append("file", file, "bookmarks.json")

                                let loader = $('<div class="broadcast__scan" style="margin: 1em 0 0 0"><div></div></div>')

                                body.find('.settings--account-user-sync').append(loader)

                                $.ajax({
                                    url: api() + 'bookmarks/sync',
                                    type: 'POST',
                                    data: formData,
                                    async: true,
                                    cache: false,
                                    contentType: false,
                                    enctype: 'multipart/form-data',
                                    processData: false,
                                    headers: {
                                        token: account.token,
                                        profile: account.profile.id
                                    },
                                    success: function (j) {
                                        if(j.secuses){
                                            Noty.show(Lang.translate('account_sync_secuses'))

                                            Bookmarks.update()

                                            loader.remove()
                                        } 
                                    },
                                    error: function(){
                                        Noty.show(Lang.translate('account_export_fail'))

                                        loader.remove()
                                    }
                                })
                            }
                        }

                        Controller.toggle('settings_component')
                    },
                    onBack: ()=>{
                        Controller.toggle('settings_component')
                    }
                })
            })

            body.find('.settings--account-user-backup').on('hover:enter',backup)

            profile()
        }
        else check()
    }
}

function profile(){
    let account = Storage.get('account','{}')

    body.find('.settings--account-user-profile .settings-param__value').text(account.profile.name)

    body.find('.settings--account-user-profile').on('hover:enter',()=>{
        showProfiles('settings_component')
    })
}

function showProfiles(controller){
    ParentalControl.personal('account_profiles',()=>{
        let account = Storage.get('account','{}')

        Loading.start(()=>{
            network.clear()

            Loading.stop()
        })

        network.clear()

        network.silent(api() + 'profiles/all',(result)=>{
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

                        Storage.set('account',account)

                        if(body) body.find('.settings--account-user-profile .settings-param__value').text(a.name)

                        notice_load.time = 0

                        Controller.toggle(controller)

                        Bookmarks.update()
                    },
                    onBack: ()=>{
                        Controller.toggle(controller)
                    }
                })
            }
            else{
                Noty.show(result.text)
            }
        },()=>{
            Loading.stop()
            
            Noty.show(Lang.translate('account_profiles_empty'))
        },false,{
            headers: {
                token: account.token
            }
        })
    },false, true)
}

function check(){
    let account = Storage.get('account','{}')

    if(account.token){
        renderStatus(Lang.translate('account_authorized'),Lang.translate('account_logged_in') + ' ' + account.email)
    }
    else{
        renderStatus(Lang.translate('account_login_failed'),Lang.translate('account_login_wait'))
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

function backup(){
    let account = Storage.get('account','{}')

    if(account.token){
        Select.show({
            title: Lang.translate('settings_cub_backup'),
            nomark: true,
            items: [
                {
                    title: Lang.translate('settings_cub_backup_export'),
                    subtitle: Lang.translate('settings_cub_backup_export_descr'),
                    export: true,
                    selected: true
                },
                {
                    title: Lang.translate('settings_cub_backup_import'),
                    subtitle: Lang.translate('settings_cub_backup_import_descr'),
                    import: true
                },
                {
                    title: Lang.translate('cancel')
                }
            ],
            onSelect: (a)=>{
                if(a.export){
                    Select.show({
                        title: Lang.translate('sure'),
                        nomark: true,
                        items: [
                            {
                                title: Lang.translate('confirm'),
                                export: true,
                                selected: true
                            },
                            {
                                title: Lang.translate('cancel')
                            }
                        ],
                        onSelect: (a)=>{
                            if(a.export){
                                let file

                                try{
                                    file = new File([JSON.stringify(localStorage)], "backup.json", {
                                        type: "text/plain",
                                    })
                                }
                                catch(e){
                                    console.log('Backup', 'file create error', e.message)
                                }

                                if(!file){
                                    try{
                                        file = new Blob([JSON.stringify(localStorage)], {type: 'text/plain'})
                                        file.lastModifiedDate = new Date()
                                    }
                                    catch(e){
                                        console.log('Backup', 'file create error', e.message)

                                        Noty.show(Lang.translate('account_export_fail'))
                                    }
                                }

                                if(file){
                                    var formData = new FormData($('<form></form>')[0])
                                        formData.append("file", file, "backup.json")

                                    let loader = $('<div class="broadcast__scan" style="margin: 1em 0 0 0"><div></div></div>')

                                    body.find('.settings--account-user-backup').append(loader)

                                    $.ajax({
                                        url: api() + 'users/backup/export',
                                        type: 'POST',
                                        data: formData,
                                        async: true,
                                        cache: false,
                                        contentType: false,
                                        enctype: 'multipart/form-data',
                                        processData: false,
                                        headers: {
                                            token: account.token
                                        },
                                        success: function (j) {
                                            if(j.secuses){
                                                if(j.limited) showLimitedAccount()
                                                else Noty.show(Lang.translate('account_export_secuses'))
                                            }
                                            else Noty.show(Lang.translate('account_export_fail'))

                                            loader.remove()
                                        },
                                        error: function(e,x){
                                            console.log('Backup', 'network error', network.errorDecode(e,x))

                                            Noty.show(Lang.translate('account_export_fail_' + (network.errorJSON(e).code || 500)))

                                            loader.remove()
                                        }
                                    })
                                }
                                else{
                                    console.log('Backup', 'file not created')
                                }
                            }

                            Controller.toggle('settings_component')
                        },
                        onBack: ()=>{
                            Controller.toggle('settings_component')
                        }
                    })
                }
                else if(a.import){
                    network.silent(api() + 'users/backup/import',(data)=>{
                        if(data.data){
                            let imp  = 0
                            let ers  = 0

                            for(let i in data.data){
                                try{
                                    localStorage.setItem(i, data.data[i])

                                    imp++
                                }
                                catch(e){
                                    ers++
                                }
                            }

                            Noty.show(Lang.translate('account_import_secuses') + ' - '+Lang.translate('account_imported')+' ('+imp+'/'+ers+') - ' + Lang.translate('account_reload_after'))

                            setTimeout(()=>{
                                window.location.reload()
                            },5000)
                        }
                        else Noty.show(Lang.translate('nodata'))
                    },()=>{
                        Noty.show(Lang.translate('account_import_fail'))
                    },false,{
                        headers: {
                            token: account.token
                        }
                    })

                    Controller.toggle('settings_component')
                }
                else{
                    Controller.toggle('settings_component')
                }
            },
            onBack: ()=>{
                Controller.toggle('settings_component')
            }
        })
    }
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
    showProfiles,
    clear: Bookmarks.clear,
    update: Bookmarks.update,
    network,
    backup,
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