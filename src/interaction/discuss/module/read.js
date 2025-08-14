import Template from '../../template'
import Storage from '../../../utils/storage'
import Account from '../../../utils/account'
import Utils from '../../../utils/math'
import Select from '../../../interaction/select'
import Controller from '../../../interaction/controller'
import Lang from '../../../utils/lang'

class Module{
    onEnter(){
        let items     = []
        let voited    = Storage.cache('discuss_voited', 100, [])
        let contoller = Controller.enabled().name

        if(voited.indexOf(this.data.id) == -1 && Account.logged()){
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
                select_scroll.body(true).prepend(Template.elem('div',{class: 'selectbox__text selector', children: [
                    Template.elem('div', {text: Utils.capitalizeFirstLetter(this.data.comment)})
                ]}))
            },
            onSelect: (item)=>{
                Controller.toggle(contoller)

                Account.voiteDiscuss({id: this.data.id, like: item.like},()=>{
                    Storage.add('discuss_voited', this.data.id)
                
                    this.emit('updateLiked', item.like)

                    Noty.show(Lang.translate('discuss_voited'))
                })
            },
            onBack: ()=>{
                Controller.toggle(contoller)
            }
        })
    }
}

export default Module