import Empty from '../empty'
import Lang from '../../../utils/lang'

class Module{
    onEmpty(event){
        let code = Lampa.Network.errorCode(event)
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
        if(code == 345){
            data.title = Lang.translate('account_login_failed')
            data.descr = Lang.translate('account_login_wait')
        }
        if(code == 245){
            data.descr = event.message || Lang.translate('subscribe_noinfo')
        }

        this.empty = new Empty(data)
        
        this.scroll.append(this.empty.render(true))
        this.start = this.empty.start.bind(this.empty)
    }
}

export default Module