import Constructor from '../constructor'
import Map from './module/map'
import Lang from '../../utils/lang'
import Utils from '../../utils/math'
import Timeline from '../timeline'

class Episode extends Constructor(Map) {
    constructor(data) {
        super(data)

        data.hash   = Utils.hash([data.season_number, data.season_number > 10 ? ':' : '', data.episode_number, data.card ? data.card.original_name : data.original_name].join(''))
        
        let out_air = new Date((data.air_date + '').replace(/-/g,'/'))
        let out_now = Date.now()
        let out_day = data.air_date ? Math.round((out_air.getTime() - out_now)/(24*60*60*1000)) : 1

        data.left_days = out_day > 0 ? out_day : 0
        data.left_text = Lang.translate('full_episode_days_left') + ': ' + (data.air_date ? out_day : '- -') 
        data.timeline  = Timeline.view(data.hash)
        data.time      = Utils.secondsToTime(data.runtime * 60, true)
        data.title     = data.name || (Lang.translate('torrent_serial_episode') + ' ' + data.episode_number)
        data.date      = data.air_date ? Utils.parseTime(data.air_date).full : '----'
        data.num       = data.episode_number
    }
}

export default Episode