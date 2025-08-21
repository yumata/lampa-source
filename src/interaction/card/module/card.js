import TMDB from '../../../utils/api/tmdb'
import Template from '../../template'

class Module {
    onCreate(){
        this.html    = Template.js('card')
        this.img     = this.html.find('.card__img') || {}

        this.img.onload = ()=>{
            this.html.addClass('card--loaded')
        }
    
        this.img.onerror = ()=>{
            console.log('Img','noload', this.img.src)

            this.img.src = './img/img_broken.svg'
        }

        this.html.card_data = this.data

        this.html.find('.card__title')?.html(this.data.title || '')

        this.html.on('visible',this.emit.bind(this, 'visible'))
        this.html.on('update',this.emit.bind(this, 'update'))
    }

    onVisible(){
        let src = ''
                
        if(this.params.style.name == 'wide' && this.data.backdrop_path) src = TMDB.img(this.data.backdrop_path, 'w780')
        else if(this.params.style.name == 'collection' && this.data.backdrop_path) src = TMDB.img(this.data.backdrop_path, 'w500')
        else if(this.data.poster_path)  src = TMDB.img(this.data.poster_path)
        else if(this.data.profile_path) src = TMDB.img(this.data.profile_path)
        else if(this.data.poster)       src = this.data.poster
        else if(this.data.img)          src = this.data.img
        else                            src = './img/img_broken.svg'

        this.img.src = src

        this.emit('update')
    }

    onDestroy(){
        this.img.onerror = ()=>{}
        this.img.onload = ()=>{}

        this.img.src = ''
    }
}

export default Module