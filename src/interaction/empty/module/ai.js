import Empty from '../empty'
import Lang from '../../../core/lang'

class Module{
    onEmpty(code){
        let data = {
            title: Lang.translate('network_error'),
            descr: Lang.translate('subscribe_noinfo')
        }

        if(code == 600){
            data.title  = Lang.translate('ai_subscribe_title')
            data.descr  = Lang.translate('ai_subscribe_descr')
            data.noicon = true
            data.width  = 'medium'
        }

        if(code == 347){
            data.title = Lang.translate('empty_title_two')
            data.descr = Lang.translate('empty_text_two')
        }

        if(code == 345 || code == 403){
            data.title = Lang.translate('account_login_failed')
            data.descr = Lang.translate('account_login_wait')
        }

        this.empty_class = new Empty(data)
        
        this.scroll.append(this.empty_class.render(true))
        this.start = this.empty_class.start.bind(this.empty_class)
    }
}

export default Module