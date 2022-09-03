import Template from './template'
import Api from './api'
import Arrays from '../utils/arrays'
import Select from './select'
import Favorite from '../utils/favorite'
import Controller from './controller'
import Account from '../utils/account'
import Storage from '../utils/storage'
import Utils from '../utils/math'
import VideoQuality from '../utils/video_quality'
import Timetable from '../utils/timetable'
import Timeline from './timeline'
import Lang from '../utils/lang'
import Tmdb from '../utils/tmdb'

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

    /**
     * Загрузить шаблон
     */
    this.build = function(){
        this.card    = Template.get(params.isparser ? 'card_parser' : 'card',data)
        this.img     = this.card.find('img')[0] || {}

        

        if(data.first_air_date){
            this.card.find('.card__view').append('<div class="card__type"></div>')
            this.card.find('.card__type').text(data.first_air_date ? 'TV' : 'MOV')
            this.card.addClass(data.first_air_date ? 'card--tv' : 'card--movie')
        }
        
        if(params.card_small){
            this.card.addClass('card--small')

            if(!Storage.field('light_version')){
                this.card.find('.card__title').remove()
                this.card.find('.card__age').remove()
            }
        }

        if(params.card_category){
            this.card.addClass('card--category')

            this.card.find('.card__age').remove()
        }

        if(params.card_collection){
            this.card.addClass('card--collection')

            this.card.find('.card__age').remove()
        }

        if(params.card_wide){
            this.card.addClass('card--wide')

            data.poster = data.cover

            if(data.promo) this.card.append('<div class="card__promo"><div class="card__promo-text">'+data.promo+'</div></div>')

            if(Storage.field('light_version')) this.card.find('.card__title').remove()

            this.card.find('.card__age').remove()
        }

        if(data.release_year == '0000'){
            this.card.find('.card__age').remove()
        }

        this.card.data('update',this.update.bind(this))

        this.update()
    }
    
    /**
     * Загрузить картинку
     */
    this.image = function(){
        this.img.onload = ()=>{
            this.card.addClass('card--loaded')
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
        this.card.find('.card__icons-inner').append('<div class="card__icon icon--'+name+'"></div>')
    }

    /**
     * Обносить состояние карточки
     */
    this.update = function(){
        let quality = !data.first_air_date && Storage.field('card_quality') ? VideoQuality.get(data) : false

        this.card.find('.card__quality,.card-watched,.card__new-episode').remove()

        if(quality){
            this.card.find('.card__view').append('<div class="card__quality"><div>'+quality+'</div></div>')
        }

        this.watched_checked = false

        this.favorite()

        if(Account.working()){
            let notices = Storage.get('account_notice',[]).filter(n=>n.card_id == data.id)

            if(notices.length){
                let notice = notices[0]

                if(Utils.parseTime(notice.date).full == Utils.parseTime(Date.now()).full && notice.method !== 'movie'){
                    this.card.find('.card__view').append('<div class="card__new-episode"><div>'+Lang.translate('card_new_episode')+'</div></div>')
                }
            }
        }

        if(this.card.hasClass('focus')) this.watched()
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
                    let date = new Date(ep.air_date).getTime()

                    return date < Date.now()
                }).slice(0,5)

                let wrap = Template.get('card_watched',{})

                next.forEach(ep=>{
                    let item = $('<div class="card-watched__item"><span>'+ep.episode_number+' - '+(ep.name || Lang.translate('noname'))+'</span></div>')

                    if(ep == viewed.ep) item.append(Timeline.render(viewed.view))

                    wrap.find('.card-watched__body').append(item)
                })

                this.watched_wrap = wrap

                this.card.find('.card__view').prepend(wrap)
            }

            this.watched_checked = true
        }

        if(this.watched_wrap){
            this.watched_wrap.toggleClass('reverce--position', this.card.offset().left > (window.innerWidth / 2) ? true : false)
        }
    }

    /**
     * Обновить иконки на закладки
     */
    this.favorite = function(){
        let status = Favorite.check(data)

        this.card.find('.card__icon').remove()

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

        Select.show({
            title: Lang.translate('title_action'),
            items: [
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
            ],
            onBack: ()=>{
                Controller.toggle(enabled)
            },
            onSelect: (a)=>{
                if(params.object) data.source = params.object.source

                Favorite.toggle(a.where, data)

                this.favorite()

                Controller.toggle(enabled)
            }
        })
    }

    /**
     * Создать
     */
    this.create = function(){
        this.build()

        this.card.on('hover:focus',(e, is_mouse)=>{
            this.watched()

            this.onFocus(e.target, data, is_mouse)
        }).on('hover:enter',(e)=>{
            this.onEnter(e.target, data)
        }).on('hover:long',(e)=>{
            this.onMenu(e.target, data)
        })

        this.image()
    }

    /**
     * Загружать картинку если видна карточка
     */
    this.visible = function(){
        if(this.visibled) return

        if(data.poster_path) this.img.src = Api.img(data.poster_path)
        else if(data.poster) this.img.src = data.poster
        else if(data.img)    this.img.src = data.img
        else this.img.src = './img/img_broken.svg'

        this.visibled = true
    }

    /**
     * Уничтожить
     */
    this.destroy = function(){
        this.img.onerror = ()=>{}
        this.img.onload = ()=>{}

        this.img.src = ''

        this.card.remove()

        this.card = null

        this.img = null
    }

    /**
     * Рендер
     * @returns {object}
     */
    this.render = function(){
        return this.card
    }
}

export default Card