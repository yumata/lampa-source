import Template from './template'
import Storage from '../core/storage/storage'
import Utils from '../utils/utils'
import Lang from '../core/lang'
import Arrays from '../utils/arrays'

class WatchedHistory {
    constructor(movie) {
        this.file_id = Utils.hash(movie.number_of_seasons ? movie.original_name : movie.original_title)
        this.html    = Template.js('watched_history')

        this.update()
    }

    set(set){
        let watched = Storage.cache('online_watched_last', 5000, {})

        if(!watched[this.file_id]) watched[this.file_id] = {}

        Arrays.extend(watched[this.file_id], set, true)

        Storage.set('online_watched_last', watched)

        this.update()
    }

    get(){
        let watched = Storage.cache('online_watched_last', 5000, {})

        return watched[this.file_id]
    }

    update(){
        let watched = this.get()
        let body    = this.html.find('.watched-history__body').empty()

        if(watched){
            let line = []

            if(watched.balanser_name) line.push(watched.balanser_name)
            if(watched.voice_name)    line.push(watched.voice_name)
            if(watched.season)        line.push(Lang.translate('torrent_serial_season') + ' ' + watched.season)
            if(watched.episode)       line.push(Lang.translate('torrent_serial_episode') + ' ' + watched.episode)

            line.forEach(n=>{
                body.append(Template.elem('span', {text: Utils.clearHtmlTags(n).trim()}))
            })
        }
        else body.append(Template.elem('span', {text: Lang.translate('no_watch_history')}))
    }

    render(js){
        return js ? this.html : $(this.html)
    }
}

export default WatchedHistory