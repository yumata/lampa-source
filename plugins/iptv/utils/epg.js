import Api from './api'

class EPG{
    static time_offset = 0

    static init(){
        let ts = new Date().getTime()

        Api.time((json)=>{
            let te = new Date().getTime()

            this.time_offset = (json.time < ts || json.time > te) ? json.time - te : 0
        })
    }

    static time(channel, timeshift = 0){
        let date   = new Date(),
            time = date.getTime() + this.time_offset,
            ofst = parseInt((localStorage.getItem('time_offset') == null ? 'n0' : localStorage.getItem('time_offset')).replace('n',''))

            date = new Date(time + (ofst * 1000 * 60 * 60))

        let offset = channel.name.match(/([+|-]\d)$/)

        if(offset){
            date.setHours(date.getHours() + parseInt(offset[1]))
        }

        let result = date.getTime()

        result -= timeshift

        return result
    }

    static position(channel, list, timeshift){
        let tim = this.time(channel, timeshift)
        let now = list.find(p=>tim > p.start && tim < p.stop)

        return now ? list.indexOf(now) : list.length - 1
    }

    static timeline(channel, program, timeshift){
        let time  = this.time(channel, timeshift)
        let total = program.stop - program.start
        let less  = program.stop - time

        return Math.min(100, Math.max(0,(1 - less / total) * 100))
    }

    static list(channel, list, size = 10, position = 0){
        let day_lst = ''
        let day_prg = ''
        let day_now = new Date(Date.now()).getDate()
        let day_nam = {}
        let display = []

        day_nam[day_now-1] = Lampa.Lang.translate('iptv_yesterday')
        day_nam[day_now]   = Lampa.Lang.translate('iptv_today')
        day_nam[day_now+1] = Lampa.Lang.translate('iptv_tomorrow')

        let watch = list[this.position(channel, list)]

        list.slice(position, position + size).forEach(elem=>{
            day_prg = new Date(elem.start).getDate()

            if(day_lst !== day_prg){
                day_lst = day_prg

                display.push({
                    type: 'date',
                    date: day_nam[day_prg] ? day_nam[day_prg] : Lampa.Utils.parseTime(elem.start).short
                })
            }

            display.push({
                type: 'program',
                program: elem,
                watch: watch == elem
            })
        })

        return display
    }
}

export default EPG