import Utils from './math'
import Storage from './storage'
import Settings from '../components/settings'
import Reguest from './reguest'
import Select from '../interaction/select'
import Noty from '../interaction/noty'
import Controller from '../interaction/controller'
import Favorite from './favorite'
import Arrays from './arrays'

let body
let network   = new Reguest()
let api       = Utils.protocol() + 'cub.watch/api/'

let notice_load = {
    time: 0,
    data: []
}

let bookmarks = []

/**
 * Запуск
 */
function init(){
    Settings.listener.follow('open',(e)=>{
        body = null

        if(e.name == 'account'){
            body = e.body

            renderPanel()

            check()
        }
    })

    Storage.listener.follow('change',(e)=>{
        if(e.name == 'account_email' || e.name == 'account_password'){
            signin()

            if(e.name == 'account_password') Storage.set('account_password','',true)
        }
    })

    Favorite.listener.follow('add,added',(e)=>{
        save('add', e.where, e.card)
    })

    Favorite.listener.follow('remove',(e)=>{
        save('remove', e.where, e.card)
    })

    update()
}

function save(method, type, card){
    let account = Storage.get('account','{}')

    if(account.token && Storage.field('account_use')){
        let list = Storage.get('account_bookmarks', '[]')
        let find = list.find((elem)=>elem.card_id == card.id && elem.type == type)

        network.clear()

        network.silent(api + 'bookmarks/'+method,update,false,{
            type: type,
            data: JSON.stringify(card),
            card_id: card.id,
            id: find ? find.id : 0
        },{
            headers: {
                token: account.token,
                profile: account.profile.id
            }
        })

        if(method == 'remove'){
            if(find) Arrays.remove(list, find)
        }
        else{
            list.push({
                id: 0,
                card_id: card.id,
                type: type,
                data: JSON.stringify(card),
                profile: account.profile.id
            })
        }

        updateBookmarks(list)
    }
}

function update(){
    let account = Storage.get('account','{}')

    if(account.token){
        network.silent(api + 'bookmarks/all?full=1',(result)=>{
            if(result.secuses){
                updateBookmarks(result.bookmarks)
            }
        },false,false,{
            headers: {
                token: account.token,
                profile: account.profile.id
            }
        })
    }
    else{
        updateBookmarks([])
    }
}

function plugins(call){
    let account = Storage.get('account','{}')

    if(account.token){
        network.silent(api + 'plugins/all',(result)=>{
            if(result.secuses){
                call(result.plugins)
            }
            else{
                call([])
            }
        },()=>{
            call([])
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

/**
 * Статус
 */
function renderStatus(name, value = ''){
    if(body){
        body.find('.settings--account-status .settings-param__value').text(name)
        body.find('.settings--account-status .settings-param__descr').text(value)
    }
}

function renderPanel(){
    if(body){
        let account = Storage.get('account','{}')
        let signed  = account.token ? true : false
        
        body.find('.settings--account-signin').toggleClass('hide',signed)
        body.find('.settings--account-user').toggleClass('hide',!signed)

        if(account.token){
            body.find('.settings--account-user-info .settings-param__value').text(account.email)
            body.find('.settings--account-user-profile .settings-param__value').text(account.profile.name)

            body.find('.settings--account-user-out').on('hover:enter',()=>{
                Storage.set('account',{})

                Settings.update()

                update()
            })

            profile()
        }
        else check()
    }
}

function profile(){
    let account = Storage.get('account','{}')

    body.find('.settings--account-user-profile .settings-param__value').text(account.profile.name)

    body.find('.settings--account-user-profile').on('hover:enter',()=>{
        network.clear()

        network.silent(api + 'profiles/all',(result)=>{
            if(result.secuses){
                Select.show({
                    title: 'Профили',
                    items: result.profiles.map((elem)=>{
                        elem.title = elem.name

                        return elem
                    }),
                    onSelect: (a)=>{
                        account.profile = a

                        Storage.set('account',account)

                        body.find('.settings--account-user-profile .settings-param__value').text(a.name)

                        Controller.toggle('settings_component')

                        update()
                    },
                    onBack: ()=>{
                        Controller.toggle('settings_component')
                    }
                })
            }
            else{
                Noty.show(result.text)
            }
        },()=>{
            Noty.show('Не удалось получить список профилей')
        },false,{
            headers: {
                token: account.token
            }
        })
        
    })
}

function check(){
    let account = Storage.get('account','{}')

    if(account.token){
        renderStatus('Авторизованы','Вы вошли под аккаунтом ' + account.email)
    }
    else{
        renderStatus('Вход не выполнен','Ожидаем входа в аккаунт')
    }
}

function working(){
    return Storage.get('account','{}').token && Storage.field('account_use')
}

function get(params){
    return bookmarks.filter(elem=>elem.type == params.type).map((elem)=>{
        return elem.data
    })
}

function updateBookmarks(rows){
    Storage.set('account_bookmarks', rows)

    bookmarks = rows.reverse().map((elem)=>{
        elem.data = JSON.parse(elem.data)

        return elem
    })
}

/**
 * Проверка авторизации
 */
function signin(){
    let email    = Storage.get('account_email','')
    let password = Storage.get('account_password','')

    if(email && password){
        network.clear()

        network.silent(api + 'users/signin',(result)=>{
            if(result.secuses){
                Storage.set('account',{
                    email: email,
                    token: result.user.token,
                    id: result.user.id,
                    profile: {
                        name: 'Общий',
                        id: 0
                    }
                })

                Settings.update()

                update()
            }
            else{
                renderStatus('Ошибка',result.text)
            }
        },()=>{
            renderStatus('Ошибка','Нет подключения к сети')
        },{
            email: email,
            password: password
        })
    }
}

function notice(call){
    let account = Storage.get('account','{}')

    if(account.token){
        if(notice_load.time + 1000*60*10 < Date.now()){
            network.timeout(1000)

            network.silent(api + 'notice/all',(result)=>{
                if(result.secuses){
                    notice_load.time = Date.now()
                    notice_load.data = result.notice

                    call(result.notice)
                }
                else call([])
            },()=>{
                call([])
            },false,{
                headers: {
                    token: account.token
                }
            })
        }
        else call(notice_load.data)
    }
    else call([])
}


export default {
    init,
    working,
    get,
    plugins,
    notice
}