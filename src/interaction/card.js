import Template from './template'
import Api from '../core/api/api'
import Arrays from '../utils/arrays'
import Select from './select'
import Favorite from '../core/favorite'
import Controller from '../core/controller'
import Storage from '../core/storage/storage'
import Utils from '../utils/utils'
import Timetable from '../core/timetable'
import Timeline from './timeline'
import Lang from '../core/lang'
import Tmdb from '../core/tmdb/tmdb'
import Manifest from '../core/manifest'
import Search from './search/global'
import Loading from './loading'
import TmdbApi from '../core/api/sources/tmdb'
import Account from '../core/account/account'

/**
 * Карточка
 * @param {object} data
 * @param {{isparser:boolean, card_small:boolean, card_category:boolean, card_collection:boolean, card_wide:true}} params 
 */
function Card(data, params = {}){
    console.warn('Card is deprecated')

    this.data   = data
    this.params = params

    Arrays.extend(data,{
        title: data.name,
        original_title: data.original_name,
        release_date: data.first_air_date 
    })

    data.release_year = ((data.release_date || data.birthday || '0000') + '').slice(0,4)

    function remove(elem){
        if(elem) elem.remove()
    }

    /**
     * Загрузить шаблон
     */
    this.build = function(){
        this.card    = Template.js(params.isparser ? 'card_parser' : 'card',data)
        this.img     = this.card.querySelector('.card__img') || {}

        this.card.card_data = data

        if(params.isparser){
            let elem_title   = this.card.querySelector('.card-parser__title')
            let elem_size    = this.card.querySelector('.card-parser__size')
            let elem_details = this.card.querySelector('.card-parser__details')
        
            if(elem_title) elem_title.innerText = data.Title
            if(elem_size) elem_size.innerText = data.size

            let seeds = document.createElement('div')
            let grabs = document.createElement('div')

            elem_details.innerHTML = ''

            seeds.innerHTML = Lang.translate('torrent_item_seeds') + ': <span>' + data.Seeders + '</span>'
            grabs.innerHTML = Lang.translate('torrent_item_grabs') + ': <span>' + data.Peers + '</span>'

            elem_details.appendChild(seeds)
            elem_details.appendChild(grabs) 
        }
        else{
            let elem_title = this.card.querySelector('.card__title')
            
            if(elem_title) elem_title.innerText = data.title

            if(data.original_name){
                let type_elem = document.createElement('div')
                    type_elem.classList.add('card__type')
                    type_elem.innerText = data.original_name ? 'TV' : 'MOV'

                this.card.querySelector('.card__view').appendChild(type_elem)
                this.card.classList.add(data.original_name ? 'card--tv' : 'card--movie')
            }
            
            
            if(params.card_small){
                this.card.classList.add('card--small')

                remove(this.card.querySelector('.card__title'))
                remove(this.card.querySelector('.card__age'))
            }

            if(params.card_category){
                this.card.classList.add('card--category')
            }

            if(params.card_explorer){
                this.card.classList.add('card--explorer')
            }

            if(params.card_collection){
                this.card.classList.add('card--collection')

                remove(this.card.querySelector('.card__age'))
            }

            if(params.card_wide){
                this.card.classList.add('card--wide')

                data.poster = data.cover

                if(data.promo || data.promo_title){
                    let promo_wrap = document.createElement('div')
                        promo_wrap.classList.add('card__promo')

                    if(data.promo_title){
                        let promo_title = document.createElement('div')
                            promo_title.classList.add('card__promo-title')
                            promo_title.innerText = data.promo_title

                        promo_wrap.appendChild(promo_title)
                    }

                    if(data.promo){
                        let promo_text = document.createElement('div')
                            promo_text.classList.add('card__promo-text')
                            promo_text.innerText = data.promo.slice(0,110) + (data.promo.length > 110 ? '...' : '')

                        promo_wrap.appendChild(promo_text)
                    }
                    
                    this.card.querySelector('.card__view').appendChild(promo_wrap)
                } 

                if(Storage.field('light_version')) remove(this.card.querySelector('.card__title'))

                remove(this.card.querySelector('.card__age'))
            }

            if(data.release_year == '0000'){
                remove(this.card.querySelector('.card__age'))
            }
            else{
                let year = this.card.querySelector('.card__age')

                if(year) year.innerText = data.release_year
            }

            
            let vote = parseFloat((data.cub_hundred_rating || data.vote_average || 0) + '').toFixed(1)

            if(vote > 0){
                let vote_elem = document.createElement('div')
                    vote_elem.classList.add('card__vote')
                    vote_elem.innerText = data.cub_hundred_fire ? Utils.bigNumberToShort(data.cub_hundred_fire) : vote >= 10 ? 10 : vote

                this.card.querySelector('.card__view').appendChild(vote_elem)
            }

            let qu = data.quality || data.release_quality

            if(qu && Storage.field('card_quality') && !data.original_name){
                let quality = document.createElement('div')
                    quality.classList.add('card__quality')
                
                let quality_inner = document.createElement('div')
                    quality_inner.innerText = qu

                    quality.appendChild(quality_inner)

                this.card.querySelector('.card__view').appendChild(quality)
            }
        }

        this.card.addEventListener('visible',this.visible.bind(this))
        this.card.addEventListener('update',this.update.bind(this))
    }
    
    /**
     * Загрузить картинку
     */
    this.image = function(){
        if(params.isparser) return

        this.img.onload = ()=>{
            this.card.classList.add('card--loaded')
        }
    
        this.img.onerror = ()=>{
            Tmdb.broken()

            console.log('Img','noload', this.img.src)

            this.img.src = './img/img_broken.svg'
        }
    }

    /**
     * Добавить иконку
     * @param {string} name 
     */
    this.addicon = function(name){
        let icon = document.createElement('div')
            icon.classList.add('card__icon')
            icon.classList.add('icon--'+name)
        
        this.card.querySelector('.card__icons-inner').appendChild(icon)
    }

    /**
     * Обносить состояние карточки
     */
    this.update = function(){
        if(params.isparser) return

        this.watched_checked = false

        if(this.watched_wrap) remove(this.watched_wrap)

        this.favorite()

        if(this.card.classList.contains('focus')) this.watched()
    }

    /**
     * Какие серии просмотрено
     */
    this.watched = function(){
        if(!Storage.field('card_episodes')) return

        if(!this.watched_checked){
            function get(callback){
                if(data.original_name) Timetable.get(data, callback)
                else callback([])
            }

            get(episodes=>{
                let viewed

                episodes.forEach(ep=>{
                    let hash = Utils.hash([ep.season_number, ep.season_number > 10 ? ':' : '',ep.episode_number,data.original_title].join(''))
                    let view = Timeline.view(hash)

                    if(view.percent) viewed = {ep, view}
                })

                if(!viewed && data.original_name){
                    let last  = Storage.get('online_watched_last', '{}')
                    let filed = last[Utils.hash(data.original_title)]

                    if(filed && filed.episode){
                        viewed = {
                            ep: {
                                episode_number: filed.episode,
                                name: Lang.translate('full_episode') + ' ' + filed.episode,
                            },
                            view: Timeline.view(Utils.hash([filed.season, filed.season > 10 ? ':' : '',filed.episode,data.original_title].join('')))
                        }
                    }
                }

                if(!viewed && !data.original_name){
                    let time = Timeline.view(Utils.hash([data.original_title].join('')))

                    if(time.percent) {
                        viewed = {
                            ep: {
                                name: Lang.translate('title_viewed') + ' ' + (time.time ? Utils.secondsToTimeHuman(time.time) : time.percent + '%'),
                            },
                            view: time
                        }
                    }
                }

                if(viewed){
                    let soon = []
                    let next = episodes.slice(episodes.indexOf(viewed.ep)).filter(ep=>ep.air_date).filter(ep=>{
                        let date = Utils.parseToDate(ep.air_date).getTime()

                        if(date > Date.now()) soon.push(ep)

                        return date < Date.now()
                    }).slice(0,5)

                    if(next.length == 0) next = [viewed.ep]

                    if(soon.length && next.length < 5 && !next.find(n=>n.episode_number == soon[0].episode_number)) next.push(soon[0])

                    let wrap = Template.js('card_watched',{})

                    next.forEach(ep=>{
                        let div  = document.createElement('div')
                        let span = document.createElement('span')
                        let date = Utils.parseToDate(ep.air_date)
                        let now  = Date.now()
                        let days = Math.ceil((date.getTime() - now)/(24*60*60*1000))

                        div.classList.add('card-watched__item')
                        div.appendChild(span)

                        span.innerText = (ep.episode_number ?  ep.episode_number + ' - ' : '') + (days > 0 ? Lang.translate('full_episode_days_left') + ': ' + days : (ep.name || Lang.translate('noname')))

                        if(ep == viewed.ep) div.appendChild(Timeline.render(viewed.view)[0])

                        wrap.querySelector('.card-watched__body').appendChild(div)
                    })

                    this.watched_wrap = wrap

                    let view = this.card.querySelector('.card__view')

                    view.insertBefore(wrap, view.firstChild)
                }
            })

            this.watched_checked = true
        }
    }

    /**
     * Обновить иконки на закладки
     */
    this.favorite = function(){
        let status = Favorite.check(data)
        let marker = this.card.querySelector('.card__marker')
        let marks  = ['look', 'viewed', 'scheduled', 'continued', 'thrown']

        this.card.querySelector('.card__icons-inner').innerHTML = ''

        if(status.book) this.addicon('book')
        if(status.like) this.addicon('like')
        if(status.wath) this.addicon('wath')
        if(status.history || Timeline.watched(data)) this.addicon('history')

        let any_marker = marks.find(m=>status[m])

        if(any_marker){
            if(!marker){
                marker = document.createElement('div')
                marker.addClass('card__marker')
                marker.append(document.createElement('span'))

                this.card.querySelector('.card__view').append(marker)
            }

            marker.find('span').text(Lang.translate('title_' + any_marker))
            marker.removeClass(marks.map(m=>'card__marker--' + m).join(' ')).addClass('card__marker--' + any_marker)
        }
        else if(marker) marker.remove()
    }

    /**
     * Вызвали меню
     * @param {object} target 
     * @param {object} data 
     */
    this.onMenu = function(target, data){
        let enabled = Controller.enabled().name
        let status  = Favorite.check(data)

        let menu_plugins = []
        let menu_favorite = [
            {
                title: Lang.translate('title_book'),
                where: 'book',
                checkbox: true,
                checked: status.book,
            },
            {
                title:  Lang.translate('title_like'),
                where: 'like',
                checkbox: true,
                checked: status.like
            },
            {
                title: Lang.translate('title_wath'),
                where: 'wath',
                checkbox: true,
                checked: status.wath
            },
            {
                title: Lang.translate('menu_history'),
                where: 'history',
                checkbox: true,
                checked: status.history
            }
        ]

        if( window.lampa_settings.account_use){
            let marks = ['look', 'viewed', 'scheduled', 'continued', 'thrown']

            menu_favorite.push({
                title: Lang.translate('settings_cub_status'),
                separator: true
            })

            marks.forEach(m=>{
                menu_favorite.push({
                    title: Lang.translate('title_'+m),
                    where: m,
                    picked: status[m],
                    collect: true,
                    noenter: !Account.hasPremium()
                })
            })
        }

        
        Manifest.plugins.forEach(plugin=>{
            if(plugin.type == 'video' && plugin.onContextMenu && plugin.onContextLauch){
                menu_plugins.push({
                    title: plugin.name,
                    subtitle: plugin.subtitle || plugin.description,
                    onSelect: ()=>{
                        if(document.body.classList.contains('search--open')) Search.close()

                        if(!data.imdb_id && data.source == 'tmdb'){
                            Loading.start(()=>{
                                Loading.stop()

                                Controller.toggle(enabled)
                            })

                            TmdbApi.external_imdb_id({
                                type: data.name ? 'tv' : 'movie',
                                id: data.id
                            },(imdb_id)=>{
                                Loading.stop()

                                data.imdb_id = imdb_id

                                plugin.onContextLauch(data)
                            })
                        }
                        else plugin.onContextLauch(data)
                    }
                })
            }
        })

        if(menu_plugins.length) menu_plugins.push({
            title: Lang.translate('more'),
            separator: true
        })
        

        let menu_main = menu_plugins.length ? menu_plugins.concat(menu_favorite) : menu_favorite

        if(this.onMenuShow) this.onMenuShow(menu_main, this.card, data)

        Select.show({
            title: Lang.translate('title_action'),
            items: menu_main,
            onBack: ()=>{
                Controller.toggle(enabled)
            },
            onCheck: (a)=>{
                if(params.object) data.source = params.object.source

                if(a.where){
                    Favorite.toggle(a.where, data)

                    this.favorite()
                }
            },
            onSelect: (a)=>{
                if(params.object) data.source = params.object.source

                if(a.collect){
                    Favorite.toggle(a.where, data)

                    this.favorite()
                }

                if(this.onMenuSelect) this.onMenuSelect(a, this.card, data)

                Controller.toggle(enabled)
            },
            onDraw: (item, elem)=>{
                if(elem.collect){
                    if(!Account.hasPremium()){
                        let wrap = $('<div class="selectbox-item__lock"></div>')
                            wrap.append(Template.js('icon_lock'))

                        item.find('.selectbox-item__checkbox').remove()

                        item.append(wrap)

                        item.on('hover:enter',()=>{
                            Select.close()

                            Account.showCubPremium()
                        })
                    }
                }
            }
        })
    }

    /**
     * Создать
     */
    this.create = function(){
        this.build()

        this.card.addEventListener('hover:focus',()=>{
            this.watched()

            if(this.onFocus) this.onFocus(this.card, data)
        })

        this.card.addEventListener('hover:touch',()=>{
            this.watched()

            if(this.onTouch) this.onTouch(this.card, data)
        })
        
        this.card.addEventListener('hover:hover',()=>{
            this.watched()

            if(this.onHover) this.onHover(this.card, data)
        })

        this.card.addEventListener('hover:enter',()=>{
            if(this.onEnter) this.onEnter(this.card, data)
        })
        
        this.card.addEventListener('hover:long',()=>{
            if(this.onMenu) this.onMenu(this.card, data)
        })

        this.image()
    }

    /**
     * Загружать картинку если видна карточка
     */
    this.visible = function(){
        let src = ''

        if(params.card_wide && data.backdrop_path) src = Api.img(data.backdrop_path, 'w780')
        else if(params.card_collection && data.backdrop_path) src = Api.img(data.backdrop_path, 'w500')
        else if(data.poster_path)  src = Api.img(data.poster_path)
        else if(data.profile_path) src = Api.img(data.profile_path)
        else if(data.poster)       src = data.poster
        else if(data.img)          src = data.img
        else                       src = './img/img_broken.svg'

        this.img.src = src

        this.update()

        if(this.onVisible) this.onVisible(this.card, data)
    }

    /**
     * Уничтожить
     */
    this.destroy = function(){
        this.img.onerror = ()=>{}
        this.img.onload = ()=>{}

        this.img.src = ''

        remove(this.card)

        this.card = null

        this.img = null
    }

    /**
     * Рендер
     * @returns {object}
     */
    this.render = function(js){
        return js ? this.card : $(this.card)
    }
}

export default Card