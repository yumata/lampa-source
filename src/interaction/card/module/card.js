import TMDB from '../../../core/api/sources/tmdb'
import Template from '../../template'
import VPN from '../../../core/vpn'

export default {
    onCreate: function(){
        this.html    = Template.js('card')
        this.img     = this.html.find('.card__img') || {}

        this.html.addClass('card--loaded')

        this.img.onerror = ()=>{
            let load_src = this.img.src

            console.log('Img','noload', load_src)

            this.img.src = './img/img_broken.svg'

            clearTimeout(this.img_timer)

            $(this.img).after(Template.elem('div', {class: 'card__img-broken', children: [
                Template.elem('div', {children: [
                    Template.elem('div', {text: VPN.code().toUpperCase()}),
                    Template.elem('br'),
                    Template.elem('div', {text: load_src.split('?')[0]})
                ]})
            ]}))

            this.img.onerror = ()=>{}
        }

        this.html.card_data = this.data

        this.html.find('.card__title')?.text(this.data.title || '')

        this.html.on('visible',this.emit.bind(this, 'visible'))
    },

    onVisible: function(){
        let src = ''
                
        if(this.params.style.name == 'wide' && this.data.backdrop_path) src = TMDB.img(this.data.backdrop_path, 'w780')
        else if(this.params.style.name == 'collection' && this.data.backdrop_path) src = TMDB.img(this.data.backdrop_path, 'w500')
        else if(this.data.poster_path)  src = TMDB.img(this.data.poster_path)
        else if(this.data.profile_path) src = TMDB.img(this.data.profile_path)
        else if(this.data.poster)       src = this.data.poster
        else if(this.data.img)          src = this.data.img
        else                            src = './img/img_broken.svg'

        this.img_timer = setTimeout(()=>{
            this.img.onerror()
        }, 1000 * 15)

        this.img.onload = ()=>{
            clearTimeout(this.img_timer)
        }

        this.img.src =  src

        this.emit('update')
    },

    onDestroy: function(){
        this.img.onerror = ()=>{}
        this.img.onload = ()=>{}

        clearTimeout(this.img_timer)

        this.img.src = ''
    }
}