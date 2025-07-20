import Storage from '../../../utils/storage'

class Module{
    onCreate(){
        this.card.addClass('card--wide')
        
        this.data.poster = this.data.cover

        if(this.data.promo || this.data.promo_title){
            let promo_wrap = document.createElement('div')
                promo_wrap.classList.add('card__promo')

            if(this.data.promo_title){
                let promo_title = document.createElement('div')
                    promo_title.classList.add('card__promo-title')
                    promo_title.innerText = this.data.promo_title

                promo_wrap.appendChild(promo_title)
            }

            if(this.data.promo){
                let promo_text = document.createElement('div')
                    promo_text.classList.add('card__promo-text')
                    promo_text.innerText = this.data.promo.slice(0,110) + (this.data.promo.length > 110 ? '...' : '')

                promo_wrap.appendChild(promo_text)
            }
            
            this.card.querySelector('.card__view').appendChild(promo_wrap)
        } 

        if(Storage.field('light_version')) remove(this.card.querySelector('.card__title'))

        this.card.querySelector('.card__age')?.remove()
    }
}

export default Module