import Api from './api'
import Permit from './permit'
import Storage from '../storage/storage'
import Timeline from '../../interaction/timeline'
import Utils from '../../utils/utils'
import Arrays from '../../utils/arrays'
import Socket from '../socket'
import WebWorker from '../../utils/worker'
import Tracker from '../tracker'
import Noty from '../../interaction/noty'
import Lang from '../lang'
import Bell from '../../interaction/bell'

let tracker = new Tracker('account_timeline_sync')

// Если в changelog пришло больше записей, чем это, проще перекачать дамп: Timeline.update() на каждую запись пишет весь файл в localStorage
let changelog_max = 500

function init(){
    Storage.listener.follow('change',(e)=>{
        if(e.name == 'account_use' || e.name == 'account') refresh()
    })

    Socket.listener.follow('open',()=>{
        if(Date.now() - window.app_time_end > 1000 * 60 * 5) update()
    })

    Socket.listener.follow('send',(e)=>{
        if(e.method == 'timeline') send(e.data)
    })

    Storage.listener.follow('clear',()=>{
        refresh()
    })
}

/**
 * Отправить прогресс просмотра на сервер
 * @param {object} data - данные для отправки
 * @param {object} data.params - параметры прогресса
 * @returns {void}
 */
function send(data){
    if(!Permit.sync) return
    
    // Отправляем только данные. Сюда часто приходит объект из Timeline.view() вместе с функцией
    // handler, а jQuery.param при сборке запроса вызывает найденные функции: handler() без
    // аргументов перезаписывает прогресс с percent: undefined, и отметка тут же слетает.
    let params = JSON.parse(JSON.stringify(data.params))

    Api.load('timeline/update', {}, params).then((result)=>{}).catch((e)=>{
        console.log('Account', 'timeline send error', e)
    })
}

/**
 * Обновить трекер и таймлайн, если сменился профиль или вошли в аккаунт
 * @returns {void}
 */
function refresh(){
    tracker.update({
        version: 0, 
        time: 0
    })

    update()
}

/**
 * Обновить таймлайн
 * @returns {void}
 */

function update(){
    if(Permit.sync){
        // Если с момента последнего обновления прошло больше 10 дней, то загружаем дамп
        if(tracker.time() < Date.now() - 1000 * 60 * 60 * 24 * 10){
            console.log('Account', 'timeline start full update', tracker.version())

            Api.load('timeline/dump', {dataType: 'text'}).then((result)=>{
                // Парсим текст в массив
                WebWorker.json({
                    type: 'parse',
                    data: result
                },(e)=>{
                    let data   = e.data
                    let name   = 'file_view_' + Permit.account.profile.id

                    if(!data.timelines){
                        return console.error('Account', 'timeline wrong dump format, no timelines:', result)
                    }

                    console.log('Account', 'timeline dump loaded, items:', Object.keys(data.timelines).length, 'profile id:', Permit.account.profile.id)

                    // Если нет файла в localStorage, то создаем его из кеша
                    if(!Storage.value(name)){
                        Storage.set(name, JSON.stringify(Storage.cache('file_view', 10000, {})))
                    }

                    let viewed = Storage.cache(name, 10000, {})

                    for(let i in data.timelines){
                        let time = data.timelines[i]

                        viewed[i] = time

                        Arrays.extend(viewed[i],{
                            duration: 0,
                            time: 0,
                            percent: 0,
                            updated: 0
                        })

                        delete viewed[i].hash
                    }

                    Storage.set(name, viewed, false, ()=>{
                        // Наверно закончилось место в localStorage, тогда сбрасываем версию на следующее обновление

                        tracker.update({
                            version: 0, 
                            time: 0
                        })

                        console.warn('Account', 'timeline dump error, not saved to storage, try again next update')
                    })

                    tracker.update({
                        version: data.version, 
                        time: Date.now()
                    })

                    Timeline.read() // Нужно прочитать прогресс просмотра из localStorage

                    console.log('Account', 'timeline dump update complete to version', data.version)
                })
            }).catch(()=>{
                console.error('Account', 'timeline dump error, not loaded')
            })
        }
        // Иначе получаем только изменения с последней версии
        else{
            console.log('Account', 'timeline start update since', tracker.version())
            
            Api.load('timeline/changelog?since=' + tracker.version()).then((result)=>{
                let total = Object.keys(result.timelines || {}).length

                console.log('Account', 'timeline changelog loaded, items:', total, 'profile id:', Permit.account.profile.id)

                // Например, с другого устройства перенесли тайм-коды кнопкой «Синхронизировать тайм-коды»
                if(total > changelog_max) return refresh()

                for(let i in result.timelines){
                    let time = result.timelines[i]
                        time.received = true // Чтоб снова не отправлять и не зациклить

                    Timeline.update(time)
                }

                tracker.update({
                    version: result.version || tracker.version(), 
                    time: Date.now()
                })

                console.log('Account', 'timeline update since complete to version', tracker.version())
            }).catch((e)=>{
                console.warn('Account', 'timeline update changelog error, no response', e)
            })
        }
    }
    // Если вышли из аккаунта, то повторно прочитываем прогресс просмотра из localStorage
    else Timeline.read()
}

/**
 * Перенести все тайм-коды этого устройства в текущий профиль CUB (CUB Premium).
 * На сервере слияние по хешу: более свежая запись побеждает, дубли не появляются — можно нажимать повторно
 * @param {function} [callback] - вызывается по завершении, успешном или нет
 * @returns {void}
 */
function sync(callback){
    let done = ()=>{
        callback && callback()
    }

    // Без входа некуда переносить: нет токена и профиля
    if(!Permit.token || !Permit.account.profile){
        console.warn('Account', 'timeline import skipped, no account')

        return done()
    }

    let viewed = Storage.get(Timeline.filename(), {})

    if(!viewed || typeof viewed !== 'object' || !Object.keys(viewed).length){
        Noty.show(Lang.translate('account_sync_timeline_empty'))

        return done()
    }

    let json = JSON.stringify(viewed)
    let file

    try{
        file = new File([json], 'timelines.json', {type: 'text/plain'})
    }
    catch(e){
        try{
            file = new Blob([json], {type: 'text/plain'})
            file.lastModifiedDate = new Date()
        }
        catch(e){
            console.warn('Account', 'timeline file create error', e.message)
        }
    }

    if(!file){
        Noty.show(Lang.translate('account_export_fail'))

        return done()
    }

    let formData = new FormData($('<form></form>')[0])
        formData.append('file', file, 'timelines.json')

    $.ajax({
        url: Api.url() + 'timeline/import',
        type: 'POST',
        data: formData,
        async: true,
        cache: false,
        contentType: false,
        enctype: 'multipart/form-data',
        processData: false,
        timeout: 1000 * 60,
        headers: {
            token: Permit.token,
            profile: Permit.account.profile.id
        },
        success: (j)=>{
            if(j && j.secuses){
                console.log('Account', 'timeline import complete', j)

                Bell.push({text: Lang.translate('account_sync_timeline_secuses') + ': ' + ((j.added || 0) + (j.updated || 0))})

                // Забираем слитый результат целиком: на сервере могли оказаться более свежие записи
                refresh()
            }
            else{
                console.error('Account', 'timeline import fail response', j)

                Noty.show(Lang.translate('account_export_fail') + (j && j.text ? ': ' + j.text : ''))
            }

            done()
        },
        error: (e)=>{
            console.error('Account', 'timeline import fail', e)

            Noty.show(Lang.translate('account_export_fail'))

            done()
        }
    })
}

export default {
    init: Utils.onceInit(init),
    update,
    sync
}