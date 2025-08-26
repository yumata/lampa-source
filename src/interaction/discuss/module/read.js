import Template from '../../template'
import Storage from '../../../core/storage/storage'
import Account from '../../../core/account/account'
import Utils from '../../../utils/utils'
import Select from '../../../interaction/select'
import Controller from '../../../core/controller'
import Lang from '../../../core/lang'
import Bell from '../../bell'

class Module{
    onCreate(){
        this.html.on('hover:enter', ()=>{
            let items     = []
            let voited    = Storage.cache('discuss_voited', 100, [])
            let contoller = Controller.enabled().name

            if(voited.indexOf(this.data.id) == -1 && Account.Permit.access){
                items = [
                    {
                        separator: true,
                        title: Lang.translate('title_action')
                    },
                    {
                        title: '<span class="settings-param__label">+1</span> ' + Lang.translate('title_like'),
                        like: 1
                    },
                    {
                        title: Lang.translate('reactions_shit'),
                        like: -1
                    }
                ]
            }
            
            Select.show({
                title: Utils.capitalizeFirstLetter(this.data.email),
                items: items,
                onFullDraw: (select_scroll)=>{
                    if(this.params.line.full_text) return

                    select_scroll.body(true).prepend(Template.elem('div',{class: 'selectbox__text selector', children: [
                        Template.elem('div', {text: Utils.capitalizeFirstLetter(this.data.comment)})
                    ]}))
                },
                onSelect: (item)=>{
                    Controller.toggle(contoller)

                    Account.Api.load('discuss/voite', {}, {
                        id: this.data.id, 
                        like: item.like
                    }).then(()=>{
                        Storage.add('discuss_voited', this.data.id)
                    
                        this.emit('updateLiked', item.like)

                        Bell.push({text: Lang.translate('discuss_voited')})
                    }).catch(()=>{})
                },
                onBack: ()=>{
                    Controller.toggle(contoller)
                }
            })
        })
    }
}

export default Module