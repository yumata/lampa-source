import Lang from '../../../core/lang'
import Template from '../../template'
import Device from '../../../core/account/device'
import Arrays from '../../../utils/arrays'
import Permit from '../../../core/account/permit'

class Module{
    onEmpty(e){
        Arrays.extend(this.params, {
            empty: {
                width: 'medium',
                buttons: []
            }
        })

        let params = this.params.empty

        if(params.router == 'subscribe'){
            params.title  = 'Ваши подписки на переводы'
            params.descr  = 'Просто подпишитесь на любимый перевод и мы будем уведомлять вас о выходе новой серии.'
            params.icon   = Template.string('icon_empty_subscribe')
        }

        if(params.router == 'bookmarks'){
            params.title  = 'Ваше избранное'
            params.descr  = 'Добавляйте в избранное понравившиеся фильмы и сериалы, чтобы быстро находить их в этом разделе.'
            params.icon   = Template.string('icon_empty_bookmarks')
        }

        if(params.router == 'favorites'){
            params.title  = params.type == 'history' ? 'Ваша история просмотров' : 'Ваше избранное'
            params.icon   = Template.string(params.type == 'history' ? 'icon_empty_history' : 'icon_empty_bookmarks')

            if(params.type == 'history') params.descr  = 'Здесь будет отображаться ваша история просмотров.'
            else params.descr  = 'Здесь будут отображаться добавленные вами в избранное фильмы и сериалы.'
        }

        if(params.router == 'mytorrents'){
            params.title  = 'Мои торренты'
            params.descr  = 'Здесь будут отображаться загруженные вами торренты через TorServer.'
            params.icon   = Template.string('icon_empty_torrents')
        }

        if(params.account && !Permit.token){
            params.buttons.push({
                title: Lang.translate('Войти в аккаунт'),
                onEnter: ()=>{
                    Device.login(this.start.bind(this))
                }
            })
        }
    }
}

export default Module