import Template from '../../template'
import TMDB from '../../../core/api/sources/tmdb'
import Utils from '../../../utils/utils'

class Module{
    onCreate(){
        this.html   = Template.js('full_episode', this.data)
        this.prefix = Template.prefix(this.html, 'full-episode')

        this.html.addClass('full-episode--small')
        
        this.html.append(Template.elem('div', {
            class: 'full-episode__viewed',
            children: [Template.js('icon_viewed')]
        }))

        this.html.on('visible',()=>{
            let src = './img/img_broken.svg'

            if(this.data.still_path) src = TMDB.img(this.data.still_path,'w300')
            else if(this.data.img)   src = this.data.img

            Utils.imgLoad(this.html.find('img'), src, ()=>{
                this.html.addClass('full-episode--loaded')
            })
        })
    }

    onViewed(){
        this.html.toggleClass('full-episode--viewed', Boolean(this.data.timeline.percent))
    }
}

export default Module