class Module{
    onCreate(){
        if(this.params.card_small){
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
    }
}

export default Module