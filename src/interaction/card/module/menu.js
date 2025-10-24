import Lang from '../../../core/lang'
import Controller from '../../../core/controller'
import Select from '../../select'
import RemoteHelper from '../../remote_helper'

export default {
    onInit: function(){
        this.menu_list = []
    },

    onCreate: function(){
        this.html.on('hover:long', ()=>{
            let enabled = Controller.enabled().name
            let menu = []

            this.menu_list.forEach((item, i)=>{
                i !== 0 && menu.push({
                    title: item.title,
                    separator: true
                })

                menu = menu.concat(item.menu())
            })

            if(!menu.length) return

            this.emit('menu', menu, this.html, this.data)

            Select.show({
                title: Lang.translate('title_action'),
                items: menu,
                onBack: ()=>{
                    Controller.toggle(enabled)
                },
                onBeforeClose: ()=>{
                    Controller.toggle(enabled)

                    return true
                }
            })
        })

        this.html.on('hover:focus', ()=>{
            if(window.app_time_end < Date.now() - 20000) RemoteHelper.show({
                name: 'card_menu'
            })
        })
    }
}