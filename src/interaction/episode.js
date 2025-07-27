import Template from './template'
import Api from './api'
import Arrays from '../utils/arrays'
import Utils from '../utils/math'
import Lang from '../utils/lang'
import Emit from '../utils/emit'

class Episode extends Emit {
    constructor(data){
        super()

        Arrays.extend(data, {params: {}})

        this.data    = data
        this.params  = data.params || {}
        this.card    = data.card || {}
        this.episode = data.episode || {}

        this.emit('init')
    }

    create(){
        this.html        = Template.js('card_episode')

        this.img_poster  = this.html.find('.card__img') || {}
        this.img_episode = this.html.find('.full-episode__img img') || {}
    
        this.img_poster.onerror = ()=>{
            this.img_poster.src = './img/img_broken.svg'
        }

        this.img_episode.onload = ()=>{
            this.html.find('.full-episode__img').addClass('full-episode__img--loaded')
        }
    
        this.img_episode.onerror = ()=>{
            this.img_episode.src = './img/img_broken.svg'
        }

        this.html.find('.card__title').text(this.card.title || this.card.name)

        this.html.find('.full-episode__name').text(this.episode.name || Lang.translate('noname'))
        this.html.find('.full-episode__num').text(this.episode.episode_number || '')
        this.html.find('.full-episode__date').text(this.episode.air_date ? Utils.parseTime(this.episode.air_date).full : '----')
        
        let release_year = ((this.card.release_date || this.card.first_air_date || '0000') + '').slice(0,4)

        if(release_year == '0000'){
            this.card.find('.card__age')?.remove()
        }
        else{
            this.card.find('.card__age').text(release_year)
        }

        this.card.on('visible', this.visible.bind(this))

        this.emit('create')
    }

    visible(){
        if(this.card.poster_path)       this.img_poster.src = Api.img(this.card.poster_path)
        else if(this.card.profile_path) this.img_poster.src = Api.img(this.card.profile_path)
        else if(this.card.poster)       this.img_poster.src = this.card.poster
        else if(this.card.img)          this.img_poster.src = this.card.img
        else                            this.img_poster.src = './img/img_broken.svg'

        if(this.episode.still_path)     this.img_episode.src = Api.img(this.episode.still_path,'w300')
        else if(this.card.backdrop_path)this.img_episode.src = Api.img(this.card.backdrop_path,'w300')
        else                            this.img_episode.src = './img/img_broken.svg'

        this.emit('visible')
    }

    render(js = true){
        return js ? this.html : $(this.html)
    }

    destroy(){
        this.img_poster.onerror  = ()=>{}
        this.img_poster.onload   = ()=>{}
        this.img_episode.onerror = ()=>{}
        this.img_episode.onload  = ()=>{}

        this.img_poster.src  = ''
        this.img_episode.src = ''

        this.html.remove()

        this.emit('destroy')
    }
}


/**
 * Карточка
 * @param {object} data
 * @param {{isparser:boolean, card_small:boolean, card_category:boolean, card_collection:boolean, card_wide:true}} params 
 */
function EpisodeOld(data, params = {}){
    let card    = data.card
    let episode = data.episode

    Arrays.extend(card,{
        title: card.name,
        original_title: card.original_name,
        release_date: card.first_air_date 
    })

    card.release_year = ((card.release_date || '0000') + '').slice(0,4)

    function remove(elem){
        if(elem) elem.remove()
    }

    /**
     * Загрузить шаблон
     */
    this.build = function(){
        this.card        = Template.js('card_episode')
        this.img_poster  = this.card.querySelector('.card__img') || {}
        this.img_episode = this.card.querySelector('.full-episode__img img') || {}

        this.card.querySelector('.card__title').innerText = card.title

        this.card.querySelector('.full-episode__name').innerText = episode.name || Lang.translate('noname')
        this.card.querySelector('.full-episode__num').innerText = episode.episode_number || ''
        this.card.querySelector('.full-episode__date').innerText = episode.air_date ? Utils.parseTime(episode.air_date).full : '----'
        
        if(card.release_year == '0000'){
            remove(this.card.querySelector('.card__age'))
        }
        else{
            this.card.querySelector('.card__age').innerText = card.release_year
        }

        this.card.addEventListener('visible',this.visible.bind(this))
    }
    
    /**
     * Загрузить картинку
     */
    this.image = function(){
        this.img_poster.onload = ()=>{
            //this.card.classList.add('card--loaded')
        }
    
        this.img_poster.onerror = ()=>{
            this.img_poster.src = './img/img_broken.svg'
        }

        this.img_episode.onload = ()=>{
            this.card.querySelector('.full-episode__img').classList.add('full-episode__img--loaded')
        }
    
        this.img_episode.onerror = ()=>{
            this.img_episode.src = './img/img_broken.svg'
        }
    }

    /**
     * Создать
     */
    this.create = function(){
        this.build()

        this.card.addEventListener('hover:focus',()=>{
            if(this.onFocus) this.onFocus(this.card, card)
        })
        
        this.card.addEventListener('hover:hover',()=>{
            if(this.onHover) this.onHover(this.card, card)
        })

        this.card.addEventListener('hover:enter',()=>{
            if(this.onEnter) this.onEnter(this.card, card)
        })

        this.image()
    }

    /**
     * Загружать картинку если видна карточка
     */
    this.visible = function(){
        if(card.poster_path)       this.img_poster.src = Api.img(card.poster_path)
        else if(card.profile_path) this.img_poster.src = Api.img(card.profile_path)
        else if(card.poster)       this.img_poster.src = card.poster
        else if(card.img)          this.img_poster.src = card.img
        else                       this.img_poster.src = './img/img_broken.svg'

        if(episode.still_path)     this.img_episode.src = Api.img(episode.still_path,'w300')
        else if(card.backdrop_path)this.img_episode.src = Api.img(card.backdrop_path,'w300')
        else                       this.img_episode.src = './img/img_broken.svg'

        if(this.onVisible) this.onVisible(this.card, card)
    }

    /**
     * Уничтожить
     */
    this.destroy = function(){
        this.img_poster.onerror = ()=>{}
        this.img_poster.onload = ()=>{}
        this.img_episode.onerror = ()=>{}
        this.img_episode.onload = ()=>{}

        this.img_poster.src = ''
        this.img_episode.src = ''

        remove(this.card)

        this.card = null

        this.img_poster = null
        this.img_episode = null
    }

    /**
     * Рендер
     * @returns {object}
     */
    this.render = function(js){
        return js ? this.card : $(this.card)
    }
}

export default Episode