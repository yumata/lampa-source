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
    },

    // Новогодние
    {
        start: '12-20T00:00:00',
        end:   '01-04T23:59:00',
        name:  'snow'
    },
    {
        start: '01-01T00:00:00',
        end:   '01-03T23:59:00',
        name:  'new-year'
    }
]

function init(){
    if(!window.lampa_settings.services) return

    events.forEach((event) => {
        const nowDate = new Date()
        const now     = nowDate.getTime()
        const year    = nowDate.getFullYear()

        let start_time = new Date(year + '-' + event.start).getTime()
        let end_time   = new Date(year + '-' + event.end).getTime()

        // событие пересекает границу года (например 12-20 -> 01-10)
        const crossYear = end_time < start_time

        if (crossYear) {
            // конец в следующем году
            end_time = new Date((year + 1) + '-' + event.end).getTime()

            // если сейчас "январская" часть окна, то старт должен быть в прошлом году
            if (now < start_time) {
                start_time = new Date((year - 1) + '-' + event.start).getTime()
                end_time   = new Date(year + '-' + event.end).getTime()
            }
        }

        event.start_time = start_time
        event.end_time   = end_time

        // обычно удобнее включать границы
        event.enabled = (start_time <= now) && (now <= end_time)
    })

    let enabled = events.filter(e => e.enabled)

    if(enabled.length){
        Utils.putScript(enabled.map(e=>Utils.protocol() + Manifest.cub_domain + '/plugin/' + e.name),()=>{})
    }
}

export default {
    init
}