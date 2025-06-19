import Template from '../interaction/template'
import Controller from '../interaction/controller'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'
import Lang from '../utils/lang'
import Modal from './modal'
import Platfrom from '../utils/platform'
import Utils from '../utils/math'
import Storage from '../utils/storage'
import Account from '../utils/account'
import Plugins from '../utils/plugins'
import Manifest from '../utils/manifest'

/**
 * Показать шаблон пустого экрана
 * @doc
 * @name class
 * @alias Empty
 * @param {Object} params заголовок и описание JSON({"title":"Заголовок","descr":"Описание"})
 * @returns {Object} объект класса
 */

function Empty(params = {}){

    Arrays.extend(params,{
        title: Lang.translate('empty_title_two'),
        descr: Lang.translate('empty_text_two'),
        noicon: false,
        width: 'large'
    })

    let html = Template.get('empty',params)

    html.addClass('empty--width-'+params.width)

    if(params.noicon) html.addClass('empty--noicon')

    this.start = function(){
        Controller.add('content',{
            toggle: ()=>{
                let selects = html.find('.selector').filter(function(){
                    return !$(this).hasClass('empty__img')
                })

                html.find('.empty__img').toggleClass('selector', selects.length > 0 ? false : true)

                Controller.collectionSet(html)
                Controller.collectionFocus(selects.length > 0 ? selects.eq(0)[0] : false,html)
            },
            left: ()=>{
                if(this.onLeft) this.onLeft()
                else if(Navigator.canmove('left')) Navigator.move('left')
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
        })

        Controller.toggle('content')
    }

    this.addInfoButton = function(add_information){
        let footer = html.find('.empty__footer')

        if(!footer.length){
            footer = $('<div class="empty__footer"></div>')

            html.append(footer)
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

    this.append = function(add){
        html.append(add)
    }

    this.render = function(add){
        if(typeof add == 'boolean') return html[0]
        
        if(add) html.append(add)

        return html
    }
}

export default Empty