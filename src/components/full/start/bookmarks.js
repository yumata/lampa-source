import Template from "../../../interaction/template"
import Controller from '../../../core/controller'
import Select from '../../../interaction/select'
import Favorite from '../../../core/favorite'
import Lang from '../../../core/lang'
import Account from '../../../core/account/account'

export default {
    onCreate: function(){
        this.html.find('.button--book').on('hover:enter',()=>{
            let status = Favorite.check(this.card)
            let marks  = ['look', 'viewed', 'scheduled', 'continued', 'thrown']

            let label = (a)=>{
                Favorite.toggle(a.type, this.card)

                if(a.collect) Controller.toggle('full_start')

                this.emit('updateFavorite')
            }

            let items = ['book', 'like', 'wath', 'history'].map(type=>{
                return {
                    title: Lang.translate('title_' + type),
                    type: type,
                    checkbox: true,
                    checked: status[type]
                }
            })

            if(window.lampa_settings.account_use){
                items.push({
                    title: Lang.translate('settings_cub_status'),
                    separator: true
                })

                marks.forEach(m=>{
                    items.push({
                        title: Lang.translate('title_'+m),
                        type: m,
                        picked: status[m],
                        collect: true,
                        noenter: !Account.hasPremium()
                    })
                })
            }

            Select.show({
                title: Lang.translate('settings_input_links'),
                items: items,
                onCheck: label,
                onSelect: label,
                onBack: ()=>{
                    Controller.toggle('full_start')
                },
                onDraw: (item, elem)=>{
                    if(elem.collect){
                        if(!Account.hasPremium()){
                            let wrap = $('<div class="selectbox-item__lock"></div>')
                                wrap.append(Template.js('icon_lock'))

                            item.append(wrap)

                            item.on('hover:enter', ()=>{
                                Select.close()

                                Account.showCubPremium()
                            })
                        }
                    }
                }
            })
        })

        this.emit('updateFavorite')
    },
    onUpdateFavorite: function(){
        let status = Favorite.check(this.card)
        let any    = Favorite.checkAnyNotHistory(status)

        $('.button--book path', this.html).attr('fill', any ? 'currentColor' : 'transparent')
    }
}