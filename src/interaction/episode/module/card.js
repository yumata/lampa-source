import Template from '../../template'
import TMDB from '../../../core/api/sources/tmdb'
import Lang from '../../../core/lang'
import Utils from '../../../utils/utils'

export default {
    onInit: function(){
        this.card  = this.data.card || {}
    },

    onCreate: function(){
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

        this.html.find('.full-episode__name').text(this.data.name || Lang.translate('noname'))
        this.html.find('.full-episode__num').text(this.data.episode_number || '')
        this.html.find('.full-episode__date').text(this.data.air_date ? Utils.parseTime(this.data.air_date).full : '----')
        
        let release_year = ((this.card.release_date || this.card.first_air_date || '0000') + '').slice(0,4)

        if(release_year == '0000'){
            this.html.find('.card__age')?.remove()
        }
        else{
            this.html.find('.card__age').text(release_year)
        }

        this.html.on('visible', this.emit.bind(this, 'visible'))
    },

    onVisible: function(){
        if(this.card.poster_path)       this.img_poster.src = TMDB.img(this.card.poster_path)
        else if(this.card.profile_path) this.img_poster.src = TMDB.img(this.card.profile_path)
        else if(this.card.poster)       this.img_poster.src = this.card.poster
        else if(this.card.img)          this.img_poster.src = this.card.img
        else                            this.img_poster.src = './img/img_broken.svg'

        if(this.data.still_path)        this.img_episode.src = TMDB.img(this.data.still_path,'w300')
        else if(this.card.backdrop_path)this.img_episode.src = TMDB.img(this.card.backdrop_path,'w300')
        else if(this.data.img)          this.img_episode.src = this.data.img
        else                            this.img_episode.src = './img/img_broken.svg'
    },

    onDestroy: function(){
        this.img_poster.onerror  = ()=>{}
        this.img_poster.onload   = ()=>{}
        this.img_episode.onerror = ()=>{}
        this.img_episode.onload  = ()=>{}

        this.img_poster.src  = ''
        this.img_episode.src = ''
    }
}