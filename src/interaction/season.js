import Emit from '../utils/emit'
import Utils from '../utils/math'
import Template from '../interaction/template'
import Lang from '../utils/lang'
import Arrays from '../utils/arrays'
import Callback from '../core/module/callback'

class Season extends Emit {
    constructor(data) {
        super()

        this.data = data

        this.use(Callback)

        this.emit('init')
    }

    create(){
        this.html   = Template.js('season_info', this.data)
        this.prefix = Template.prefix(this.html, 'season-info')

        let head = []
        
        if(this.data.vote_average) head.push(Lang.translate('title_rating') + ': ' + parseFloat(this.data.vote_average +'').toFixed(1))
        if(this.data.air_date)     head.push(Lang.translate('full_date_of_release') + ': ' + Utils.parseTime(this.data.air_date).full)
        
        head.push(Lang.translate('title_episodes') + ': ' + this.data.episodes.length)

        this.prefix.head.append(Arrays.flatMap(head.map(s=>$('<span>'+s+'</span>')), ()=>$('<span>&nbsp; ● &nbsp;</span>')))

        if(!this.html.overview) this.prefix.overview.remove()

        this.emit('create')
    }

    render(){
        return this.html
    }

    destroy(){
        this.html.remove()

        this.emit('destroy')
    }
}

export default Season