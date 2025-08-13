import Template from '../../template'
import TMDB from '../../../utils/api/tmdb'

class Module{
    onCreate(){
        this.html   = Template.js('full_episode', this.data)
        this.prefix = Template.prefix(this.html, 'full-episode')
        
        this.html.append(Template.elem('div', {
            class: 'full-episode__viewed',
            children: [Template.js('icon_viewed')]
        }))

        this.html.on('visible',()=>{
            let img = this.html.find('img')

            img.onerror = ()=>{
                img.src = './img/img_broken.svg'
            }

            img.onload = ()=>{
                this.html.addClass('full-episode--loaded')
            }

            if(this.data.still_path) img.src = TMDB.img(this.data.still_path,'w300')
            else if(this.data.img)   img.src = this.data.img
            else img.src = './img/img_broken.svg'
        })
    }

    onViewed(){
        this.html.toggleClass('full-episode--viewed', Boolean(this.data.timeline.percent))
    }
}

export default Module