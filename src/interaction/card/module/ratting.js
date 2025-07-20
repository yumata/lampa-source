import Utils from '../../../utils/math'

class Module{
    onCreate(){
        let vote = parseFloat((this.data.cub_hundred_rating || this.data.vote_average || 0) + '').toFixed(1)
        
        if(vote > 0){
            let vote_elem = document.createElement('div')
                vote_elem.addClass('card__vote')
                vote_elem.text(this.data.cub_hundred_fire ? Utils.bigNumberToShort(this.data.cub_hundred_fire) : vote >= 10 ? 10 : vote)

            this.card.find('.card__view').append(vote_elem)
        }
    }
}

export default Module