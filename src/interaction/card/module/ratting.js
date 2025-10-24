import Utils from '../../../utils/utils'
import Template from '../../template'

export default {
    onCreate: function(){
        let vote = parseFloat((this.data.cub_hundred_rating || this.data.vote_average || 0) + '').toFixed(1)
        
        if(vote > 0){
            this.html.find('.card__view').append(Template.elem('div', {class: 'card__vote', text: this.data.cub_hundred_fire ? Utils.bigNumberToShort(this.data.cub_hundred_fire) : vote >= 10 ? 10 : vote}))
        }
    }
}