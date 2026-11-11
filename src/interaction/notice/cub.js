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
import Socket from '../../core/socket'
import Bell from '../bell'

function escapeHtml(str){
    return (str + '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
}

// Совет друга: на CUB карточка без описания и с названием на языке отправителя — берём описание и название из TMDB
function enrichRecommend(element, oncomplite) {
    let card = element.card || {}

    if (!card.id || card.overview) return oncomplite(element)

    Api.sources.tmdb.get(element.method + '/' + card.id, {}, (data) => {
        let title = data.title || data.name

        // три строки, как у «Премьеры» (advert/premiere.js)
        if (data.overview) element.text = escapeHtml(data.overview.length > 130 ? data.overview.slice(0, 130).replace(/\s+\S*$/, '') + '...' : data.overview)
        if (title) element.title = Lang.translate('notice_friend_recommend') + ': ' + escapeHtml(title)
        if (!element.poster && data.poster_path) element.poster = data.poster_path

        oncomplite(element)
    }, () => {
        oncomplite(element)
    }, { life: 60 * 24 * 7 })
}

function enrichTmdbNotice(element, oncomplite) {
    let card = element.card || {}

    if (element.data && element.data.type == 'friend_recommend') return enrichRecommend(element, oncomplite)

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

        // CUB шлёт notice: {events: [{seq, type, title, text, url, name, profile, card, time}]} сразу после события (cub utils/notify.js).
        // Здесь — ответы на комментарии и служебные, события друзей показывает core/account/friends.js
        Socket.listener.follow('message', (result)=>{
            if(result && result.method == 'notice' && result.data && Array.isArray(result.data.events)) this.socket(result.data.events)
        })

        Timer.add(1000 * 60 * 5, this.update.bind(this))

        this.update()
    }

    socket(events){
        if(!Permit.access) return

        let profile = Permit.profile.id
        let reload  = false

        events.forEach((event)=>{
            if(!event || typeof event !== 'object') return

            // уведомление другого профиля этого аккаунта — в его колокольчике
            if(event.profile && profile && event.profile != profile) return

            if(event.type == 'discuss_reply'){
                let title = event.card && event.card.title ? event.card.title : ''

                Bell.push({
                    from: escapeHtml(event.name || ''),
                    text: (title ? Lang.translate('notice_socket_reply').replace('{title}', escapeHtml(title)) : Lang.translate('notice_discuss_reply')) +
                          (event.text ? '<br>' + escapeHtml(event.text.slice(0, 120)) : '')
                })

                reload = true
            }
            // всплывающее показывает core/account/friends.js, здесь — только список
            else if(event.type == 'friend_recommend'){
                reload = true
            }
            else if(event.type == 'system' && event.title){
                Bell.push({
                    from: escapeHtml(event.title),
                    text: escapeHtml(event.text || '')
                })
            }
        })

        // ответ или совет уже лежит в notice/all — обновить список и счётчик, не дожидаясь опроса раз в 5 мин
        if(reload) this.update()
    }

    update(){
        Account.Api.notices((result)=>{
            let notices = result.map((item)=>{
                let data

                try{
                    data = JSON.parse(item.data)
                }
                catch(e){
                    return null
                }

                if(data.type == 'discuss_reply') return this.discussReply(item, data)
                if(data.type == 'friend_recommend') return this.friendRecommend(item, data)

                if(!data.card) return null

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
            }).filter(Boolean)

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

    discussReply(item, data){
        let card   = data.card && data.card.id ? data.card : null
        let method = data.method || ((item.card_id + '').indexOf('tv_') == 0 ? 'tv' : 'movie')
        let title  = card ? (!Lang.selected(['ru', 'uk', 'be']) ? (card.original_title || card.original_name) : (card.title || card.name)) : ''

        return {
            time: item.time || Utils.parseToDate(item.date).getTime(),
            title: Lang.translate('notice_discuss_reply') + (title ? ': ' + escapeHtml(title) : ''),
            text: escapeHtml(data.parent_comment || ''),
            poster: card ? card.poster_path : '',
            card: card,
            method: method,
            author: {
                name: escapeHtml(data.from || ''),
                img: Utils.protocol() + Manifest.cub_domain + '/img/profiles/' + encodeURIComponent(data.icon || 'l_1') + '.png',
                text: escapeHtml(data.comment || '')
            },
            data: data,
            item: item
        }
    }

    /**
     * Совет друга (cub api/friends.js notifyRecommend): постер, «Совет друга: название», описание фильма,
     * внизу друг с комментарием; OK — карточка
     */
    friendRecommend(item, data){
        let card = data.card && data.card.id ? data.card : null

        if(!card) return null

        let method = data.method == 'tv' ? 'tv' : 'movie'
        let title  = !Lang.selected(['ru', 'uk', 'be']) ? (card.original_title || card.original_name || card.title || card.name) : (card.title || card.name)

        return {
            time: item.time || Utils.parseToDate(item.date).getTime(),
            title: Lang.translate('notice_friend_recommend') + (title ? ': ' + escapeHtml(title) : ''),
            text: escapeHtml(card.overview || ''),
            poster: card.poster_path || '',
            card: card,
            method: method,
            author: {
                name: escapeHtml(data.from || ''),
                img: Utils.protocol() + Manifest.cub_domain + '/img/profiles/' + encodeURIComponent(data.icon || 'l_1') + '.png',
                text: escapeHtml(data.comment || Lang.translate('notice_friend_recommend_text'))
            },
            data: data,
            item: item
        }
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
