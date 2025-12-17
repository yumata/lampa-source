import Storage from '../../../core/storage/storage'
import Template from '../../template'

export default {
    onCreate: function(){
        let data = this.data

        if(data.original_name){
            this.html.find('.card__view')?.append(Template.elem('div', {class: 'card__type', text: data.original_name ? 'TV' : 'MOV'}))
            this.html.addClass(data.original_name ? 'card--tv' : 'card--movie')
        }

        let qu = data.quality || data.release_quality
        
        if(qu && Storage.field('card_quality') && !data.original_name){
            this.html.find('.card__view')?.append(Template.elem('div', {class: 'card__quality', children: [
                Template.elem('div', {text: qu})
            ]}))
        }
    }
}