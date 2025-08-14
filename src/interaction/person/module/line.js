import Template from '../../template'
import TMDB from '../../../utils/api/tmdb'
import Lang from '../../../utils/lang'

class Module{
    onCreate(){
        this.html   = Template.js('season_episode', this.data)
        this.prefix = Template.prefix(this.html, 'season-episode')

        this.data.role = this.data.character || this.data.job || Lang.translate('title_actor')
        
        this.html = Template.js('full_person', this.data)

        this.html.on('visible',()=>{
            let img = this.html.find('img')
            
            img.onerror = ()=>{
                img.src = './img/actor.svg'
            }

            img.onload = ()=>{
                this.html.addClass('full-person--loaded')
            }

            img.src = this.data.profile_path ? TMDB.img(this.data.profile_path, 'w276_and_h350_face') : this.data.img || './img/actor.svg'
        })
    }
}

export default Module