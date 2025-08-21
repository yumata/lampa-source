import Storage from '../../../utils/storage'
import Template from '../../template'

class Module{
    onCreate(){
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

export default Module