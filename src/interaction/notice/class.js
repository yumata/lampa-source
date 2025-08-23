import Lang from '../../core/lang'

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

    empty(){
        return Lang.translate('notice_none_system')
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