import Lang from '../../../core/lang'
import Template from '../../template'
import Device from '../../../core/account/device'

class Module{
    onEmpty(e){
        let code = e.decode_code

        if(!this.params.empty) this.params.empty = {}

        if(code == 345 || code == 403){
            this.params.empty.title  = 'Ваши подписки на переводы'
            this.params.empty.descr  = 'Получайте сообшшение о выходе серии в переводе. Просто подпишитесь на любимый перевод и мы будем уведомлять вас о выходе новой серии.'
            this.params.empty.icon   = Template.string('icon_bell_plus')

            this.params.empty.buttons = [
                {
                    title: Lang.translate('Войти в аккаунт'),
                    onEnter: ()=>{
                        Device.login(this.start.bind(this))
                    }
                }
            ]
        }
    }
}

export default Module