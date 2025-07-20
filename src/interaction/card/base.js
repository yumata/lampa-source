import Emit from '../../utils/emit'

import Template from '../template'
import Api from '../api'
import Arrays from '../../utils/arrays'

class Base extends Emit{
    constructor(data, params = {}) {
        super()

        Arrays.extend(data,{
            title: data.name,
            original_title: data.original_name,
            release_date: data.first_air_date 
        })

        this.data   = data
        this.params = params
    }

    create() {
        this.card    = Template.js('card')
        this.img     = this.card.find('.card__img') || {}

        this.img.onload = ()=>{
            this.card.addClass('card--loaded')
        }
    
        this.img.onerror = ()=>{
            console.log('Img','noload', this.img.src)

            this.img.src = './img/img_broken.svg'
        }

        this.card.card_data = this.data

        this.card.find('.card__title')?.html(this.data.title || '')

        this.card.addEventListener('visible',this.visible.bind(this))
        this.card.addEventListener('update',this.update.bind(this))

        this.emit('create')
    }

    visible(){
        let src = ''
        
        if(this.params.card_wide && this.data.backdrop_path) src = Api.img(this.data.backdrop_path, 'w780')
        else if(this.params.card_collection && this.data.backdrop_path) src = Api.img(this.data.backdrop_path, 'w500')
        else if(this.data.poster_path)  src = Api.img(this.data.poster_path)
        else if(this.data.profile_path) src = Api.img(this.data.profile_path)
        else if(this.data.poster)       src = this.data.poster
        else if(this.data.img)          src = this.data.img
        else                            src = './img/img_broken.svg'

        this.img.src = src

        this.emit('visible')

        this.update()

        if(this.onVisible) this.onVisible(this.card, this.data)
    }

    update(){
        this.emit('update')
    }

    render(js) {
        return js ? this.card : $(this.card)
    }

    destroy() {
        this.img.onerror = ()=>{}
        this.img.onload = ()=>{}

        this.img.src = ''

        this.card?.remove()

        this.emit('destroy')
    }
}

export default Base