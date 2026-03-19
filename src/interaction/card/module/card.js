import TMDB from '../../../core/api/sources/tmdb'
import TMDBApi from '../../../core/tmdb/tmdb'
import Template from '../../template'
import VPN from '../../../core/vpn'

export default {
    onInit: function(){
        this.getPosterPath = ()=>{
            let src = ''
                
            if(this.params.style.name == 'wide' && this.data.backdrop_path) src = TMDB.img(this.data.backdrop_path, 'w780')
            else if(this.params.style.name == 'collection' && this.data.backdrop_path) src = TMDB.img(this.data.backdrop_path, 'w500')
            else if(this.data.poster_path)  src = TMDB.img(this.data.poster_path)
            else if(this.data.profile_path) src = TMDB.img(this.data.profile_path)
            else if(this.data.poster)       src = this.data.poster
            else if(this.data.img)          src = this.data.img
            else                            src = './img/img_broken.svg'

            return src
        }
    },
    onCreate: function(){
        this.html    = Template.js('card')
        this.img     = this.html.find('.card__img') || {}

        this.img_errors = 0

        this.html.addClass('card--loaded')

        this.img.onerror = ()=>{
            let load_src = this.img.src

            console.log('Img','noload', load_src)

            TMDBApi.broken(load_src)

            this.img_errors++

            clearTimeout(this.img_timer)

            if(this.img_errors > 3){
                this.img.src = './img/img_broken.svg'

                $(this.img).after(Template.elem('div', {class: 'card__img-broken', children: [
                    Template.elem('div', {children: [
                        Template.elem('div', {text: VPN.code().toUpperCase()}),
                        Template.elem('br'),
                        Template.elem('div', {text: load_src.split('?')[0]})
                    ]})
                ]}))

                this.img.onerror = ()=>{}
            }
            else{
                this.img_timer_next = setTimeout(()=>{
                    let next_src = this.getPosterPath()

                    if(next_src == load_src) this.img.onerror()
                    else this.img.src = next_src
                }, 2000)
            }
        }

        this.html.card_data = this.data

        this.html.find('.card__title')?.text(this.data.title || '')

        this.html.on('visible',this.emit.bind(this, 'visible'))
    },

    onVisible: function(){
        let src = this.getPosterPath()

        this.img_timer = setTimeout(()=>{
            this.img.onerror()
        }, 1000 * 15)

        this.img.onload = ()=>{
            clearTimeout(this.img_timer)
            clearTimeout(this.img_timer_next)
        }

        this.img.src =  src

        this.emit('update')
    },

    onDestroy: function(){
        this.img.onerror = ()=>{}
        this.img.onload = ()=>{}

        clearTimeout(this.img_timer)
        clearTimeout(this.img_timer_next)

        this.img.src = ''
    }
}