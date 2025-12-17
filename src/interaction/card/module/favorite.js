import Favorite from '../../../core/favorite'
import Timeline from '../../timeline'
import Lang from '../../../core/lang'
import Account from '../../../core/account/account'
import Select from '../../select'
import Template from '../../template'

export default {
    onCreate: function(){
        let onCheck = (a)=>{
            Favorite.toggle(a.where, this.data)
        }

        let onSelect = (a)=>{
            onCheck(a)

            this.emit('menuSelect', a, this.html, this.data)
        }

        let onDraw = (item)=>{
            if(!Account.hasPremium()){
                let wrap = $('<div class="selectbox-item__lock"></div>')
                    wrap.append(Template.js('icon_lock'))

                item.find('.selectbox-item__checkbox').remove()

                item.append(wrap)

                item.on('hover:enter',()=>{
                    Select.close()

                    Account.showCubPremium()
                })
            }
        }

        function drawMenu(){
            let status  = Favorite.check(this.data)
            let menu    = []
            let items_check  = ['book', 'like', 'wath', 'history']
            let items_mark   = ['look', 'viewed', 'scheduled', 'continued', 'thrown']

            items_check.forEach(c=>{
                menu.push({
                    title: Lang.translate('title_' + c),
                    where: c,
                    checkbox: true,
                    checked: status[c],
                    onCheck
                })
            })
            
            if( window.lampa_settings.account_use){
                menu.push({
                    title: Lang.translate('settings_cub_status'),
                    separator: true
                })

                items_mark.forEach(m=>{
                    menu.push({
                        title: Lang.translate('title_'+m),
                        where: m,
                        picked: Account.hasPremium() ? status[m] : false,
                        collect: true,
                        noenter: !Account.hasPremium(),
                        onSelect,
                        onDraw
                    })
                })
            }

            return menu
        }

        this.menu_list.push({
            title: Lang.translate('settings_input_links'),
            menu: drawMenu.bind(this),
        })

        this.listenerFavorite = (e)=>{
            if(e.target == 'favorite'){
                if(e.card){
                    if(e.card.id == this.data.id) this.emit('favorite')
                }
                else this.emit('favorite')
            }
        }

        Lampa.Listener.follow('state:changed', this.listenerFavorite)
    },

    onUpdate: function(){
        this.emit('favorite')
    },

    onAddicon: function(name){
        this.html.find('.card__icons-inner').append(Template.elem('div', {class: 'card__icon icon--' + name}))
    },

    onFavorite: function(){
        let status = Favorite.check(this.data)
        let marker = this.html.find('.card__marker')
        let marks  = ['look', 'viewed', 'scheduled', 'continued', 'thrown']

        this.html.find('.card__icons-inner').innerHTML = ''

        if(status.book) this.emit('addicon','book')
        if(status.like) this.emit('addicon','like')
        if(status.wath) this.emit('addicon','wath')
        if(status.history || Timeline.watched(this.data)) this.emit('addicon','history')

        let any_marker = marks.find(m=>status[m])

        if(any_marker){
            if(!marker){
                marker = Template.elem('div', {class: 'card__marker', children: [
                    Template.elem('span')
                ]})

                this.html.find('.card__view').append(marker)
            }

            marker.find('span').text(Lang.translate('title_' + any_marker))
            marker.removeClass(marks.map(m=>'card__marker--' + m).join(' ')).addClass('card__marker--' + any_marker)
        }
        else if(marker) marker.remove()
    },

    onDestroy: function(){
        Lampa.Listener.remove('state:changed', this.listenerFavorite)
    }
}