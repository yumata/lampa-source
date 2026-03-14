import Template from '../template'
import Controller from '../../core/controller'
import Activity from '../activity/activity'
import Arrays from '../../utils/arrays'
import Lang from '../../core/lang'
import Modal from '../modal'
import Platfrom from '../../core/platform'
import Utils from '../../utils/utils'
import Storage from '../../core/storage/storage'
import Account from '../../core/account/account'
import Plugins from '../../core/plugins'
import Manifest from '../../core/manifest'
import Emit from '../../utils/emit'
import Background from '../background'
import TMDB from '../../core/api/sources/tmdb'

/**
 * Показать шаблон пустого экрана
 * @doc
 * @name class
 * @alias Empty
 * @param {Object} params заголовок и описание JSON({"title":"Заголовок","descr":"Описание"})
 * @returns {Object} объект класса
 */

class Empty extends Emit{
    constructor(params = {}){
        super()

        Arrays.extend(params,{
            title: Lang.translate('empty_title_two'),
            descr: Lang.translate('empty_text_two'),
            text: Lang.translate('empty_text_two'),
            noicon: false,
            width: 'large',
            template: 'empty',
            icon: '',
            buttons: []
        })

        this.params = params
        this.html   = Template.get(params.template, params)

        this.html.addClass('layer--wheight')

        if(params.noicon)    this.noicon()
        else if(params.icon) this.html.addClass('empty--custom-icon').find('.empty__icon').append(params.icon)

        params.buttons.push({
            title: Lang.translate('terminal_update'),
            onEnter: ()=>{
                delete params.buttons

                Activity.replace()
            }
        })

        if(params.buttons.length) this.addButtons(params.buttons)

        this.width(params.width)

        this.emit('init')
    }

    noicon(){
        this.html.addClass('empty--noicon')
    }

    width(width){
        this.html.removeClass('empty--width-large empty--width-medium empty--width-small')

        this.html.addClass('empty--width-' + width)
    }

    start(){
        this.emit('start')
        
        let controller = {
            link: this,
            toggle: ()=>{
                let selects = this.html.find('.selector').filter(function(){
                    return !$(this).hasClass('empty__img')
                })

                this.html.find('.empty__img').toggleClass('selector', selects.length > 0 ? false : true)

                Controller.collectionSet(this.html)
                Controller.collectionFocus(selects.length > 0 ? selects.eq(0)[0] : false, this.html)

                Background.change(TMDB.img('/oXPYD4c3bLtfAS2FzwjZh7NWqo4.jpg','w200'))
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else Controller.toggle('menu')
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else Controller.toggle('head')
            },
            down: ()=>{
                Navigator.move('down')
            },
            right: ()=>{
                Navigator.move('right')
            },
            back: ()=>{
                Activity.backward()
            }
        }
        
        this.emit('controller', controller)

        Controller.add('content', controller)

        Controller.toggle('content')
    }

    addButtons(buttons){
        let footer = this.html.find('.empty__footer')

        if(!footer.length){
            footer = $('<div class="empty__footer"></div>')

            this.html.append(footer)
        }

        buttons.forEach((button_data)=>{
            let button = $(`<div class="simple-button selector">${button_data.title}</div>`)

            button.on('hover:enter',()=>{
                if(button_data.onEnter) button_data.onEnter()
            })

            footer.append(button)
        })
    }

    addInfoButton(add_information){
        let footer = this.html.find('.empty__footer')

        if(!footer.length){
            footer = $('<div class="empty__footer"></div>')

            this.html.append(footer)
        }

        let button = $('<div class="simple-button selector">'+Lang.translate('extensions_info')+'</div>')

        button.on('hover:enter',()=>{
            let controller = Controller.enabled().name

            let html = $('<div></div>')
            let line = (name, value) => {
                html.append($(`<div class="console__line selector"><span class="console__time">${name}</span> - <span>${value}</span></div>`))
            }

            line('Protocol', window.location.protocol)
            line('Host', window.location.host)
            line('Platform', Platfrom.get())
            line('Safe connection', Storage.field('protocol') == 'https' ? 'Yes' : 'No')
            line('Connection', Utils.protocol())
            line('TMDB Proxy', Storage.field('tmdb_proxy') ? 'Yes' : 'No')
            line('TMDB Proxy plugin',  Plugins.loaded().find(u=>/\/plugin\/tmdb-proxy/.test(u)) ? 'Yes' : 'No')
            line('TMDB Proxy api',  Lampa.TMDB.api('').split('/').slice(0,3).join('/'))
            line('Premium', Account.hasPremium() ? 'Yes' : 'No')
            line('Mirror', Manifest.cub_domain)

            if(add_information){
                add_information.forEach((info)=>{
                    line(info[0],info[1])
                })
            }

            Modal.open({
                title: Lang.translate('extensions_info'),
                html: html,
                size: 'medium',
                onBack: ()=>{
                    Modal.close()

                    Controller.toggle(controller)
                }
            })
        })

        footer.append(button)
    }

    append(add){
        this.html.append(add)
    }

    render(js){
        return js ? this.html[0] : this.html
    }

    destroy(){
        this.html.remove()

        this.emit('destroy')
    }
}

export default Empty