class Module{
    onCreate(){
        if(this.params.card_small || this.params.card_wide){
            this.card.addClass('card--small')

            this.card.find('.card__title')?.remove()
            this.card.find('.card__age')?.remove()
        }

        if(this.params.card_category){
            this.card.addClass('card--category')
        }

        if(this.params.card_explorer){
            this.card.addClass('card--explorer')
        }

        if(this.params.card_collection){
            this.card.addClass('card--collection')

            this.card.querySelector('.card__age')?.remove()
        }

        if(this.params.card_wide){
            this.card.addClass('card--wide')
                    
            this.data.poster = this.data.cover
    
            
            let promo_wrap = document.createElement('div')
                promo_wrap.addClass('card__promo')

            if(this.data.title || this.data.name){
                let promo_title = document.createElement('div')
                    promo_title.addClass('card__promo-title')
                    promo_title.text(this.data.title || this.data.name)

                promo_wrap.append(promo_title)
            }

            if(this.data.overview){
                let promo_text = document.createElement('div')
                    promo_text.addClass('card__promo-text')
                    promo_text.text(this.data.overview.slice(0,110) + (this.data.overview.length > 110 ? '...' : ''))

                promo_wrap.append(promo_text)
            }
            
            this.card.find('.card__view').append(promo_wrap)
            
        }
    }
}

export default Module