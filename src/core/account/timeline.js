import Api from './api'
import Permit from './permit'
import Storage from '../storage/storage'
import Timeline from '../../interaction/timeline'
import Utils from '../../utils/utils'
import Arrays from '../../utils/arrays'
import Socket from '../socket'
import WebWorker from '../../utils/worker'
import Tracker from '../tracker'

let tracker = new Tracker('account_timeline_sync')

function init(){
    Storage.listener.follow('change',(e)=>{
        if(e.name == 'account_use' || e.name == 'account') refrash()
    })

    Socket.listener.follow('open',()=>{
        if(Date.now() - window.app_time_end > 1000 * 60 * 5) update()
    })

    Storage.listener.follow('clear',()=>{
        refrash()
    })
}

/**
 * Обновить трекер и таймлайн, если сменился профиль или вошли в аккаунт
 * @returns {void}
 */
function refrash(){
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

                    // Если нет файла в localStorage, то создаем его из кеша
                    if(window.localStorage.getItem(name) === null){
                        Storage.set(name, JSON.stringify(Storage.cache('file_view', 10000, {})))
                    }

                    let viewed = Storage.cache(name, 10000, {})

                    for(let i in data.timelines){
                        let time = data.timelines[i]

                        viewed[i] = time

                        Arrays.extend(viewed[i],{
                            duration: 0,
                            time: 0,
                            percent: 0
                        })

                        delete viewed[i].hash
                    }

                    Storage.set(name, viewed, false, ()=>{
                        // Наверно закончилось место в localStorage, тогда сбрасываем версию на следующее обновление

                        tracker.update({
                            version: 0, 
                            time: 0
                        })

                        console.log('Account', 'timeline dump error, not saved to storage, try again next update')
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

export default {
    init: Utils.onceInit(init),
    update
}