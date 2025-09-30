import Template from '../../template'
import Timeline from '../../timeline'
import Utils from '../../../utils/utils'
import TMDB from '../../../core/api/sources/tmdb'

export default {
    onCreate: function(){
        this.html   = Template.js('season_episode', this.data)
        this.prefix = Template.prefix(this.html, 'season-episode')
        
        if(this.data.vote_average){
            this.prefix.info.append(Template.js('season_episode_rate',{rate: parseFloat(this.data.vote_average +'').toFixed(1)}))
        }

        if(this.data.air_date){
            this.data.vote_average && this.prefix.info.append(Template.elem('span', {class: 'season-episode-split', text: '●'}))

            this.prefix.info.append(Template.elem('span', {text: Utils.parseTime(this.data.air_date).full}))
        }

        if(this.data.left_days){
            this.prefix.quality.text(this.data.left_text)
            this.html.style.opacity = 0.5
        }

        let visible = ()=>{
            this.prefix.loader.remove()
                
            this.prefix.img.append(Template.elem('div', {class: 'season-episode__episode-number',text: ('0' + this.data.episode_number).slice(-2)}))
        }

        this.prefix.timeline.append(Timeline.render(this.data.timeline))

        this.html.on('visible',()=>{
            let img = this.html.find('img')

            img.onerror = ()=>{
                img.src = './img/img_broken.svg'
            }

            img.onload = ()=>{
                this.prefix.img.addClass('season-episode__img--loaded')

                visible()
            }

            if(this.data.still_path) img.src = TMDB.img('t/p/w300' + this.data.still_path)
            else if(this.data.img)   img.src = this.data.img
            else visible()
        })
    },

    onViewed: function(){
        this.html.find('.season-episode__viewed')?.remove()
        
        let mark = Template.elem('div', {class: 'season-episode__viewed', children: [Template.js('icon_viewed')]})
                    
        if(Boolean(this.data.timeline.percent)) this.html.find('.season-episode__img').append(mark)
    }
}