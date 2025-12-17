import Utils from '../utils/utils'
import Manifest from '../core/manifest'

let events = [
    {
        start: '10-25T00:00:00',
        end:   '10-31T23:59:00',
        name:  'halloween'
    },
    {
        start: '11-24T00:00:00',
        end:   '11-30T23:59:00',
        name:  'black-friday'
    }
]

function init(){
    events.forEach((event)=> {
        let now  = new Date().getTime()
        let year = new Date().getFullYear()

        let start_time = new Date(year + '-' + event.start).getTime()
        let end_time   = new Date(year + '-' + event.end).getTime()

        if(end_time < start_time){
            end_time = new Date((year + 1) + '-' + event.end).getTime()
        }

        event.start_time = start_time
        event.end_time   = end_time
        event.enabled    = start_time < now && now < end_time
    })

    let enabled = events.filter(e => e.enabled)

    if(enabled.length){
        Utils.putScript(enabled.map(e=>Utils.protocol() + Manifest.cub_domain + '/plugin/' + e.name),()=>{})
    }
}

export default {
    init
}