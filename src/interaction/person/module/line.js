import Template from '../../template'
import TMDB from '../../../utils/api/tmdb'
import Lang from '../../../utils/lang'
import Utils from '../../../utils/math'

class Module{
    onCreate(){
        this.data.role = this.data.character || this.data.job || Lang.translate('title_actor')
        
        this.html = Template.js('full_person', this.data)

        this.html.on('visible',()=>{
            Utils.imgLoad(this.html.find('img'), this.data.profile_path ? TMDB.img(this.data.profile_path, 'w276_and_h350_face') : this.data.img || './img/actor.svg', ()=>{
                this.html.addClass('full-person--loaded')
            })
        })
    }
}

export default Module