import Api from './api'
import Permit from './permit'
import Storage from '../storage/storage'
import Timeline from '../../interaction/timeline'
import Utils from '../../utils/utils'
import Arrays from '../../utils/arrays'
import Socket from '../socket'

function init(){
    Storage.listener.follow('change',(e)=>{
        if(e.name == 'account_use' || e.name == 'account') update(true)
    })

    Socket.listener.follow('open',()=>{
        if(Date.now() - window.app_time_end > 1000 * 60 * 5) update(false, true)
    })
}

/**
 * Обновить таймлайн
 * @param {Boolean} full обновить полностью или только новые элементы
 * @param {Boolean} visual обновить визуально Timeline.update когда socket открылся
 */

function update(full = false, visual = false){
    if(Permit.sync){
        let url = 'timeline/all'
        let all = full

        console.log('Timeline', 'full update:', Utils.parseTime(Storage.get('timeline_full_update_time','0')).briefly)

        if(Storage.get('timeline_full_update_time','0') + 1000 * 60 * 60 * 24 < Date.now() && !visual) all = true

        if(all) url = url + '?full=true'

        Api.load(url).then((result)=>{
            let name = 'file_view_' + Permit.account.profile.id

            if(visual){
                for(let i in result.timelines){
                    let time = result.timelines[i]
                        time.received = true

                    Timeline.update(time)
                }
            }
            else{
                if(window.localStorage.getItem(name) === null){
                    Storage.set(name, Arrays.clone(Storage.cache('file_view',10000,{})))
                }

                let viewed = Storage.cache(name,10000,{})

                for(let i in result.timelines){
                    let time = result.timelines[i]

                    viewed[i] = time

                    Arrays.extend(viewed[i],{
                        duration: 0,
                        time: 0,
                        percent: 0
                    })

                    delete viewed[i].hash
                }

                if(all) Storage.set('timeline_full_update_time',Date.now())

                Storage.set(name, viewed, false, ()=>{
                    Storage.set('timeline_full_update_time', 0)
                })

                Timeline.read()
            }

            console.log('Timeline', 'update success: total', Arrays.getKeys(Storage.get(name,'{}')).length, 'items', 'load:', Arrays.getKeys(result.timelines).length, 'items')
        }).catch((e)=>{
            if(e == 403){
                Storage.set('timeline_full_update_time',0)
            }
            else{
                console.log('Timeline', 'update error:', e)
            }
        })
    }
}

export default {
    init: Utils.onceInit(init),
    update
}