import Favorite from '../../../utils/favorite'
import Timeline from '../../timeline'
import Lang from '../../../utils/lang'
import Account from '../../../utils/account'
import Select from '../../select'
import Template from '../../template'
import Menu from './menu'


class Module{
    onCreate(){
        if(this.has(Menu)){
            let onCheck = (a)=>{
                if(this.params.object) this.data.source = this.params.object.source

                Favorite.toggle(a.where, this.data)

                this.emit('favorite')
            }

            let onSelect = (a)=>{
                onCheck(a)

                if(this.onMenuSelect) this.onMenuSelect(a, this.card, this.data)
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

                return menu
            }

            this.menu_list.push({
                title: Lang.translate('title_favorite'),
                menu: drawMenu.bind(this),
            })
        }
    }

    onUpdate(){
        this.emit('favorite')
    }

    onAddicon(name){
        let icon = document.createElement('div')
            icon.classList.add('card__icon')
            icon.classList.add('icon--'+name)
        
        this.card.querySelector('.card__icons-inner').appendChild(icon)
    }

    onFavorite(){
        let status = Favorite.check(this.data)
        let marker = this.card.querySelector('.card__marker')
        let marks  = ['look', 'viewed', 'scheduled', 'continued', 'thrown']

        this.card.querySelector('.card__icons-inner').innerHTML = ''

        if(status.book) this.emit('addicon','book')
        if(status.like) this.emit('addicon','like')
        if(status.wath) this.emit('addicon','wath')
        if(status.history || Timeline.watched(this.data)) this.emit('addicon','history')

        let any_marker = marks.find(m=>status[m])

        if(any_marker){
            if(!marker){
                marker = document.createElement('div')
                marker.addClass('card__marker')
                marker.append(document.createElement('span'))

                this.card.querySelector('.card__view').append(marker)
            }

            marker.find('span').text(Lang.translate('title_' + any_marker))
            marker.removeClass(marks.map(m=>'card__marker--' + m).join(' ')).addClass('card__marker--' + any_marker)
        }
        else if(marker) marker.remove()
    }
}

export default Module