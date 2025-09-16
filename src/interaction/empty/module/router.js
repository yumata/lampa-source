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
            params.title  = Lang.translate('empty_subscribes_title')
            params.descr  = Lang.translate('empty_subscribes_text')
            params.icon   = Template.string('icon_empty_subscribe')
        }

        if(params.router == 'bookmarks'){
            params.title  = Lang.translate('empty_bookmark_title')
            params.descr  = Lang.translate('empty_bookmark_text')
            params.icon   = Template.string('icon_empty_bookmarks')
        }

        if(params.router == 'favorites'){
            params.title  = Lang.translate(params.type == 'history' ? 'empty_history_title' : 'empty_bookmark_title')
            params.icon   = Template.string(params.type == 'history' ? 'icon_empty_history' : 'icon_empty_bookmarks')

            if(params.type == 'history') params.descr  = Lang.translate('empty_history_text')
            else params.descr  = Lang.translate('empty_bookmark_text')
        }

        if(params.router == 'mytorrents'){
            params.title  = Lang.translate('empty_mytorrents_title')
            params.descr  = Lang.translate('empty_mytorrents_text')
            params.icon   = Template.string('icon_empty_torrents')
        }

        if(params.account && !Permit.token){
            params.buttons.push({
                title: Lang.translate('settings_cub_signin_button'),
                onEnter: ()=>{
                    Device.login(this.start.bind(this))
                }
            })
        }
    }
}

export default Module