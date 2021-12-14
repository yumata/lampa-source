import Utils from './math'
import Storage from './storage'
import Settings from '../components/settings'
import Reguest from './reguest'
import Select from '../interaction/select'
import Noty from '../interaction/noty'
import Controller from '../interaction/controller'
import Favorite from './favorite'

let body
let network   = new Reguest()
let api       = Utils.protocol() + 'cub.watch/api/'

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
        network.clear()

        network.silent(api + 'bookmarks/'+method,update,false,{
            type: type,
            data: JSON.stringify(card)
        },{
            headers: {
                token: account.token,
                profile: account.profile.id
            }
        })
    }
}

function update(){
    let account = Storage.get('account','{}')

    if(account.token){
        network.silent(api + 'bookmarks/all?full=1',(result)=>{
            if(result.secuses){
                Storage.set('account_bookmarks', result.bookmarks)
            }
        },false,false,{
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

function renderPanel(){
    if(body){
        let account = Storage.get('account','{}')
        let signed  = account.token ? true : false
        
        body.find('.settings--account-signin').toggleClass('hide',signed)
        body.find('.settings--account-user').toggleClass('hide',!signed)

        if(account.token){
            body.find('.settings--account-user-info .settings-param__value').text(account.email)
            body.find('.settings--account-user-profile .settings-param__value').text(account.profile.name)

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
    let rows = Storage.get('account_bookmarks', '[]')

    return rows.reverse().filter(elem=>elem.type == params.type).map((elem)=>{
        return JSON.parse(elem.data)
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


export default {
    init,
    working,
    get
}