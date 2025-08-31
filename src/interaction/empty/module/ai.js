import Empty from '../empty'
import Lang from '../../../core/lang'
import Device from '../../../core/account/device'
import Advert from '../../advert/modal'

class Module{
    onEmpty(e){
        let code = e.decode_code

        let data = {
            title: Lang.translate('network_error'),
            descr: Lang.translate('subscribe_noinfo')
        }

        if(code == 600){
            data.title  = Lang.translate('ai_subscribe_title')
            data.descr  = Lang.translate('ai_subscribe_descr')
            data.noicon = true
            data.width  = 'medium'

            data.buttons = [
                {
                    title: Lang.translate('Подробнее о CUB Premium'),
                    onEnter: Advert.get.bind(Advert)
                }
            ]
        }

        if(code == 347){
            data.title = Lang.translate('empty_title_two')
            data.descr = Lang.translate('empty_text_two')
        }

        if(code == 345 || code == 403){
            data.title  = 'Все еще без аккаунта?'
            data.descr  = 'Войдите в аккаунт, чтобы получить доступ к этому разделу.'
            data.noicon = true

            data.buttons = [
                {
                    title: Lang.translate('Войти в аккаунт'),
                    onEnter: ()=>{
                        Device.login(this.start.bind(this))
                    }
                }
            ]
        }

        this.empty_class = new Empty(data)
        
        this.scroll.append(this.empty_class.render(true))
        this.start = this.empty_class.start.bind(this.empty_class)
    }
}

export default Module