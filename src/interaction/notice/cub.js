import Lang from '../../core/lang'
import Account from '../../core/account/account'
import Notice from './notice'
import NoticeClass from './class'
import Storage from '../../core/storage/storage'
import Utils from '../../utils/utils'
import Manifest from '../../core/manifest'
import Platform from '../../core/platform'
import Timer from '../../core/timer'
import Cache from '../../utils/cache'
import Permit from '../../core/account/permit'
import Api from '../../core/api/api'

function enrichTmdbNotice(element, oncomplite) {
    let card = element.card || {}

    if (!card.imdb_id) return oncomplite(element)

    let method = 'find/' + card.imdb_id + '?external_source=imdb_id'

    Api.sources.tmdb.get(method, {}, (data) => {
        let movie = data.movie_results && data.movie_results[0]
        let tv    = data.tv_results && data.tv_results[0]
        let tmdb  = card.seasons ? tv || movie : movie || tv

        if (tmdb) {
            tmdb.source = 'tmdb'
            tmdb.imdb_id = card.imdb_id
            tmdb.imdb_rating = card.imdb_rating
            tmdb.kp_rating = card.kp_rating
            tmdb.release_quality = card.release_quality
            tmdb.countries = card.countries
            tmdb.seasons = card.seasons
            tmdb.episode = card.episode

            element.card = tmdb
            element.title = tmdb.title || tmdb.name || element.title
            element.poster = tmdb.poster_path || element.poster
        }

        oncomplite(element)
    }, () => {
        oncomplite(element)
    }, { life: 60 * 24 * 7 })
}

function enrichTmdbNotices(items, oncomplite) {
    let result = []
    let index = 0
    let active = 0
    let limit = 4

    function next() {
        if (index >= items.length && active == 0) return oncomplite(result)

        while (active < limit && index < items.length) {
            let position = index
            let element = items[index]

            index++
            active++

            enrichTmdbNotice(element, (updated) => {
                result[position] = updated
                active--
                next()
            })
        }
    }

    next()
}

class NoticeCub extends NoticeClass {
    constructor(params = {}){
        super(params)

        this.name = 'CUB'
        this.time = Storage.get('cub_notice_time','0')

        this.notices = []

        Cache.getData('other', 'cub_notice').then(data=>{
            if(data && Permit.sync) this.notices = data
        }).catch(e=>{})

        Storage.listener.follow('change', (e)=>{
            if(e.name == 'account' || e.name == 'account_use'){
                if(!Permit.sync) this.notices = []
                else this.update()
            }
        })

        Timer.add(1000 * 60 * 5, this.update.bind(this))

        this.update()
    }

    update(){
        Account.Api.notices((result)=>{
            let notices = result.map((item)=>{
                let data = JSON.parse(item.data)
                let text = Lang.translate('notice_new_quality')

                let labels = []

                if(data.card.seasons){
                    let k = []

                    for(let i in data.card.seasons) k.push(i)

                    let s = k.pop()

                    labels.push('S - <b>'+s+'</b>')
                    labels.push('E - <b>'+data.card.seasons[s]+'</b>')

                    if(data.voice) labels.push(data.voice)

                    text = Lang.translate('notice_new_episode')
                }
                else{
                    labels.push(Lang.translate('notice_quality') + ' - <b>' + data.card.quality + '</b>')
                }

                return {
                    time: item.time || Utils.parseToDate(item.date).getTime(),
                    title: !Lang.selected(['ru', 'uk', 'be']) ? (data.card.original_title || data.card.original_name) : (data.card.title || data.card.name),
                    text: text,
                    poster: data.card.poster ? data.card.poster : data.card.img ? data.card.img : data.card.poster_path,
                    card: data.card,
                    labels: labels,
                    data: data,
                    item: item
                }
            })

            notices.sort((a,b)=>{
                return a.time > b.time ? -1 : a.time < b.time ? 1 : 0
            })

            enrichTmdbNotices(notices, (items)=>{
                this.notices = items

                Cache.rewriteData('other', 'cub_notice', this.notices)

                Notice.drawCount()
            })
        })
    }

    viewed(){
        Storage.set('cub_notice_time',Date.now())

        this.time = Date.now()

        Notice.drawCount()
    }

    empty(){
        let item = super.empty(Lang.translate('empty_title_two'), Lang.translate('notice_none_account'))

        if(!Account.Permit.access){
            item = super.empty(Lang.translate('account_none_title'), Lang.translate('notice_none'))

            if(Platform.screen('tv')) Utils.qrcode('https://' + Manifest.cub_site, item.find('.notice__img'))

            return item
        }

        return item
    }

    count(){
        return this.notices.filter(n=>n.time > this.time).length
    }

    items(){
        return this.notices
    }
}

export default NoticeCub
