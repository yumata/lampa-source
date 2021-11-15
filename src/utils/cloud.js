import Utils from './math'
import Storage from './storage'
import Settings from '../components/settings'
import Reguest from './reguest'

let body
let code    = 0
let network = new Reguest()
let fields  = ['torrents_view','plugins','favorite','file_view']

/**
 * Запуск
 */
function init(){
    if(Storage.field('cloud_use')) status(1)

    Settings.listener.follow('open',(e)=>{
        body = null

        if(e.name == 'cloud'){
            body = e.body

            renderStatus()
        }
    })

    Storage.listener.follow('change',(e)=>{
        if(e.name == 'cloud_token'){
            login(start)
        }
        else if(e.name == 'cloud_use'){
            if(e.value == 'true') login(start)
            else status(0)
        }
        else if(fields.indexOf(e.name) >= 0){
            save()
        }
    })

    login(start)
}

/**
 * Статус
 * @param {Int} c - код
 */
function status(c){
    code = c

    renderStatus()
}

/**
 * Рендер статуса
 */
function renderStatus(){
    if(body){
        let item = body.find('.settings--cloud-status'),
            name = item.find('.settings-param__name'),
            desc = item.find('.settings-param__descr')

        if(code == 0){
            name.text('Отключено')
            desc.text('Включите синхронизацию')
        }
        if(code == 1){
            name.text('Не авторизованы')
            desc.text('Необходимо авторизоваться ')
        }
        if(code == 2){
            name.text('Авторизация не удалась')
            desc.text('Проверьте введённые данные и повторите попытку')
        }
        if(code == 3){
            name.text('Вошли')
            desc.text('Вы успешно авторизовались')
        }
        if(code == 4){
            let time = Utils.parseTime(Storage.get('cloud_time'))

            name.text('Синхронизовано')
            desc.text(time.full + ' в ' + time.time)
        }
    }
}

/**
 * Проверка авторизации
 * @param {Function} good - успешно
 * @param {Function} fail - провал
 */
function login(good, fail){
    if(Storage.get('cloud_token') && Storage.field('cloud_use')){
        let id = Storage.get('cloud_login_id', '')

        network.silent('https://api.github.com/gists'+(id ? '/' + id : ''),(data)=>{
            status(3)

            Storage.set('cloud_login_id', data.id)

            if(good) good()
        },()=>{
            status(2)

            if(fail) fail()
        },JSON.stringify({
            'files': {
                'lampa-login.json': {
                    'content': '{"login":true}'
                }
            }
        }),{
            beforeSend: {
                name: 'Authorization',
                value: 'bearer ' + Storage.get('cloud_token')
            },
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        })
    }
    else{
        status(Storage.field('cloud_use') ? 1 : 0)

        if(fail) fail()
    }
}

/**
 * Считываем файл и обновляем данные с облака
 * @param {Object} file
 * @param {Object} item
 */
function read(file, item){
    let time = Storage.get('cloud_time', '2021.01.01')

    if(time !== item.updated_at){
        network.silent(file.raw_url,(data)=>{
            Storage.get('cloud_time', file.updated_at)

            for(let i in data){
                Storage.set(i, data[i])
            }

            status(4)
        })
    }
}

/**
 * Получаем список файлов
 */
function start(){
    if(Storage.get('cloud_token') && Storage.field('cloud_use')){
        network.silent('https://api.github.com/gists',(data)=>{
            let file
            let item

            data.forEach((elem)=>{
                for(let i in elem.files){
                    if(elem.files[i].filename == 'lampa-data.json'){
                        item = elem
                        file = elem.files[i]
                    }
                }
            })

            if(file) read(file, item)
            else save()
        },()=>{

        },false,{
            beforeSend: {
                name: 'Authorization',
                value: 'bearer ' + Storage.get('cloud_token')
            },
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        })
    }
}

/**
 * Сохраняем закладки в облако
 */
function save(){
    if(Storage.get('cloud_token') && Storage.field('cloud_use')){

        let conent = JSON.stringify({
            torrents_view: Storage.get('torrents_view','[]'),
            plugins: Storage.get('plugins','[]'),
            favorite: Storage.get('favorite','{}'),
            file_view: Storage.get('file_view','[]'),
        },null, 4)

        let id = Storage.get('cloud_data_id', '')

        network.silent('https://api.github.com/gists' + (id ? '/'+id : ''),(data)=>{
            Storage.set('cloud_time', data.updated_at)
            Storage.set('cloud_data_id', data.id)

            status(4)
        },()=>{
            status(5)
        },JSON.stringify({
            'files': {
                'lampa-data.json': {
                    'content': conent
                }
            }
        }),{
            beforeSend: {
                name: 'Authorization',
                value: 'bearer ' + Storage.get('cloud_token')
            },
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        })
    }
}

export default {
    init
}