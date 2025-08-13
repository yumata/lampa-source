import Emit from '../../utils/emit'
import Arrays from '../../utils/arrays'
import Lang from '../../utils/lang'
import Utils from '../../utils/math'
import Timeline from '../timeline'
import Activity from '../activity'

class Base extends Emit{
    constructor(data) {
        super()

        Arrays.extend(data, {params: {}})

        this.data   = data
        this.params = data.params

        data.hash   = Utils.hash([data.season_number, data.season_number > 10 ? ':' : '', data.episode_number, Activity.props().get('card')?.original_title].join(''))

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

    create() {
        this.html = document.createElement('div')

        this.emit('create')
    }

    render() {
        return this.html
    }

    destroy() {
        this.html.remove()

        this.emit('destroy')
    }
}

export default Base