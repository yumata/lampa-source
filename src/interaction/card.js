import Template from './template'
import Api from './api'
import Arrays from '../utils/arrays'
import Select from './select'
import Favorite from '../utils/favorite'
import Controller from './controller'
import Storage from '../utils/storage'
import Utils from '../utils/math'
import Timetable from '../utils/timetable'
import Timeline from './timeline'
import Lang from '../utils/lang'
import Tmdb from '../utils/tmdb'
import Manifest from '../utils/manifest'
import Search from '../components/search'

/**
 * Карточка
 * @param {object} data
 * @param {{isparser:boolean, card_small:boolean, card_category:boolean, card_collection:boolean, card_wide:true}} params 
 */
function Card(data, params = {}){
    Arrays.extend(data,{
        title: data.name,
        original_title: data.original_name,
        release_date: data.first_air_date 
    })

    data.release_year = ((data.release_date || '0000') + '').slice(0,4)

    function remove(elem){
        if(elem) elem.remove()
    }

    /**
     * Загрузить шаблон
     */
    this.build = function(){
        this.card    = Template.js(params.isparser ? 'card_parser' : 'card',data)
        this.img     = this.card.querySelector('.card__img') || {}

        this.card.querySelector('.card__title').innerText = data.title

        if(data.first_air_date){
            let type_elem = document.createElement('div')
                type_elem.classList.add('card__type')
                type_elem.innerText = data.first_air_date ? 'TV' : 'MOV'

            this.card.querySelector('.card__view').appendChild(type_elem)
            this.card.classList.add(data.first_air_date ? 'card--tv' : 'card--movie')
        }
        
        if(params.card_small){
            this.card.classList.add('card--small')

            if(!Storage.field('light_version')){
                remove(this.card.querySelector('.card__title'))
                remove(this.card.querySelector('.card__age'))
            }
        }

        if(params.card_category){
            this.card.classList.add('card--category')
        }

        if(params.card_collection){
            this.card.classList.add('card--collection')

            remove(this.card.querySelector('.card__age'))
        }

        if(params.card_wide){
            this.card.classList.add('card--wide')

            data.poster = data.cover

            if(data.promo) this.card.append('<div class="card__promo"><div class="card__promo-text">'+data.promo.slice(0,110) + (data.promo.length > 110 ? '...' : '') +'</div></div>')

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

        
        let vote = parseFloat((data.vote_average || 0) + '').toFixed(1)

        if(vote > 0){
            let vote_elem = document.createElement('div')
                vote_elem.classList.add('card__vote')
                vote_elem.innerText = vote

            this.card.querySelector('.card__view').appendChild(vote_elem)
        }

        if(data.quality){
            let quality = document.createElement('div')
                quality.classList.add('card__quality')
            
            let quality_inner = document.createElement('div')
                quality_inner.innerText = data.quality

                quality.appendChild(quality_inner)

            this.card.querySelector('.card__view').appendChild(quality)
        }

        this.card.addEventListener('visible',this.visible.bind(this))
        this.card.addEventListener('update',this.update.bind(this))
    }
    
    /**
     * Загрузить картинку
     */
    this.image = function(){
        this.img.onload = ()=>{
            this.card.classList.add('card--loaded')
        }
    
        this.img.onerror = ()=>{
            Tmdb.broken()

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
            let episodes = Timetable.get(data)
            let viewed

            episodes.forEach(ep=>{
                let hash = Utils.hash([ep.season_number,ep.episode_number,data.original_title].join(''))
                let view = Timeline.view(hash)

                if(view.percent) viewed = {ep, view}
            })

            if(viewed){
                let next = episodes.slice(episodes.indexOf(viewed.ep)).filter(ep=>{
                    let date = Utils.parseToDate(ep.air_date).getTime()

                    return date < Date.now()
                }).slice(0,5)

                let wrap = Template.js('card_watched',{})
                    wrap.querySelector('.card-watched__title').innerText = Lang.translate('title_watched')

                next.forEach(ep=>{
                    let div = document.createElement('div')
                    let span = document.createElement('span')

                    div.classList.add('card-watched__item')
                    div.appendChild(span)

                    span.innerText = ep.episode_number+' - '+(ep.name || Lang.translate('noname'))

                    if(ep == viewed.ep) div.appendChild(Timeline.render(viewed.view)[0])

                    wrap.querySelector('.card-watched__body').appendChild(div)
                })

                this.watched_wrap = wrap

                let view = this.card.querySelector('.card__view')

                view.insertBefore(wrap, view.firstChild)
            }

            this.watched_checked = true
        }
    }

    /**
     * Обновить иконки на закладки
     */
    this.favorite = function(){
        let status = Favorite.check(data)

        this.card.querySelector('.card__icons-inner').innerHTML = ''

        if(status.book) this.addicon('book')
        if(status.like) this.addicon('like')
        if(status.wath) this.addicon('wath')
        if(status.history) this.addicon('history')
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
                title: status.book ? Lang.translate('card_book_remove') : Lang.translate('card_book_add'),
                subtitle: Lang.translate('card_book_descr'),
                where: 'book'
            },
            {
                title: status.like ? Lang.translate('card_like_remove') : Lang.translate('card_like_add'),
                subtitle: Lang.translate('card_like_descr'),
                where: 'like'
            },
            {
                title: status.wath ? Lang.translate('card_wath_remove') : Lang.translate('card_wath_add'),
                subtitle: Lang.translate('card_wath_descr'),
                where: 'wath'
            },
            {
                title: status.history ? Lang.translate('card_history_remove') : Lang.translate('card_history_add'),
                subtitle: Lang.translate('card_history_descr'),
                where: 'history'
            }
        ]

        
        Manifest.plugins.forEach(plugin=>{
            if(plugin.type == 'video' && plugin.onContextMenu && plugin.onContextLauch){
                menu_plugins.push({
                    title: plugin.name,
                    subtitle: plugin.subtitle || plugin.description,
                    onSelect: ()=>{
                        if(document.body.classList.contains('search--open')) Search.close()

                        plugin.onContextLauch(data)
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
            onSelect: (a)=>{
                if(params.object) data.source = params.object.source

                if(a.where){
                    Favorite.toggle(a.where, data)

                    this.favorite()
                }

                if(this.onMenuSelect) this.onMenuSelect(a, this.card, data)

                Controller.toggle(enabled)
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
        
        this.card.addEventListener('hover:hover',()=>{
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
        if(params.card_wide && data.backdrop_path) this.img.src = Api.img(data.backdrop_path, 'w780')
        else if(data.poster_path) this.img.src = Api.img(data.poster_path)
        else if(data.profile_path) this.img.src = Api.img(data.profile_path)
        else if(data.poster)      this.img.src = data.poster
        else if(data.img)         this.img.src = data.img
        else                      this.img.src = './img/img_broken.svg'

        this.update()

        if(this.onVisible) this.onVisible()
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