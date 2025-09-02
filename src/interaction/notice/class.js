import Lang from '../../core/lang'
import Template from '../template'

class NoticeClass{
    constructor(params = {}){
        this.params = params
        this.name   = 'Noname'
    }

    active(){
        return true
    }

    push(element, resolve, reject){
        resolve()
    }

    empty(title, descr){
        let item = Template.get('notice_card',{
            title: title || '',
            descr: descr || Lang.translate('notice_none_system'),
            time: ''
        })

        item.addClass('image--icon image--loaded')

        item.find('.notice__img').html(Template.string('icon_bell_plus'))
        
        return item
    }

    viewed(){}

    items(){
        return []
    }

    count(){
        return 0
    }
}

export default NoticeClass