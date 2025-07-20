import Storage from '../../../utils/storage'

class Module{
    onCreate(){
        let data = this.data

        if(data.original_name){
            let type_elem = document.createElement('div')
                type_elem.addClass('card__type')
                type_elem.text(data.original_name ? 'TV' : 'MOV')

            this.card.find('.card__view')?.append(type_elem)
            this.card.addClass(data.original_name ? 'card--tv' : 'card--movie')
        }

        let qu = data.quality || data.release_quality
        
        if(qu && Storage.field('card_quality') && !data.original_name){
            let quality = document.createElement('div')
                quality.addClass('card__quality')
            
            let quality_inner = document.createElement('div')
                quality_inner.text(qu)

                quality.append(quality_inner)

            this.card.find('.card__view')?.append(quality)
        }
    }
}

export default Module