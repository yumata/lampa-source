import Modal from './modal'
import Controller from './controller'
import Template from './template'
import Activity from './activity'
import Utils from '../utils/math'
import Lang from '../utils/lang'
import Arrays from '../utils/arrays'
import TMDB from '../utils/tmdb'
import Subscribe from '../utils/subscribe'
import Api from '../interaction/api'

import NoticeAll from './notice/all'
import NoticeLampa from './notice/lampa'
import NoticeCub from './notice/cub'

function translate(str){
    if(Arrays.isObject(str)){
        let code = Lampa.Storage.get('language','ru')

        if(str[code]) return str[code]
        else if(str.ru) return str.ru
        else return str[Arrays.getKeys(str)[0]]
    }
    
    return str
}

class Notice{
    constructor(){
        this.listener = Subscribe()
        this.display  = 'all'
        this.classes  = {}
    }

    init(){
        this.classes.all   = new NoticeAll()
        this.classes.lampa = new NoticeLampa()
        this.classes.cub   = new NoticeCub()

        Lampa.Listener.follow('app',e=>{
            if(e.type == 'ready') this.drawCount()
        })
    }

    open(){
        if(Lampa.Controller.enabled().name == 'modal') Modal.close()

        let html       = $('<div></div>')
        let tabs       = []
        let viever     = this.classes[this.display]
        let items      = viever.items()
        let navigation = $('<div class="navigation-tabs"></div>')
        
        for(let name in this.classes){
            let count = this.classes[name].count()
            let tab   = {
                name,
                count
            }

            tabs.push(tab)
        }

        tabs.forEach((tab, i)=>{
            let button = $('<div class="navigation-tabs__button selector">'+this.classes[tab.name].name+'</div>')

            if(tab.count) button.append('<span class="navigation-tabs__badge">'+tab.count+'</span>')

            button.on('hover:enter',()=>{
                this.display = tab.name

                this.open()
            })

            if(tab.name == this.display) button.addClass('active')

            if(i > 0) navigation.append('<div class="navigation-tabs__split">|</div>')

            navigation.append(button)
        })

        html.append(navigation)
        
        items.forEach(element => {
            let item = Template.get('notice_card',{})
            let icon = element.poster || element.icon || element.img

            let author_data = {}
            let author_html

            item.addClass('image--' + (element.poster ? 'poster' : element.icon ? 'icon' : element.img ? 'img' : 'none'))

            item.find('.notice__title').html(translate(element.title))
            item.find('.notice__descr').html(translate(element.text))
            item.find('.notice__time').html(Utils.parseTime(element.time).short)

            if(element.labels) item.find('.notice__descr').append($('<div class="notice__footer">'+element.labels.map(label=>'<div>' + translate(label) + '</div>').join(' ')+'</div>'))

            if(element.author){
                author_data = translate(element.author)
                author_html = $(`<div class="notice__author">
                    <div class="notice__author-img">
                        <img />
                    </div>
                    <div class="notice__author-body">
                        <div class="notice__author-name"></div>
                        <div class="notice__author-text"></div>
                    </div>
                </div>`)

                author_html.find('.notice__author-name').html(author_data.name)
                author_html.find('.notice__author-text').html(author_data.text)

                item.find('.notice__body').append(author_html)
            }

            item.on('hover:enter',()=>{
                if(element.card){
                    this.close()

                    Activity.push({
                        url: '',
                        component: 'full',
                        id: element.card.id,
                        method: element.card.number_of_seasons || element.card.seasons ? 'tv' : 'movie',
                        card: element.card,
                        source: Lang.selected(['ru', 'uk', 'be']) ? 'cub' : ''
                    })
                }
                else this.listener.send('select',{display: element.display || this.display, element})
            }).on('visible',()=>{
                if(icon){
                    icon = translate(icon)

                    if(icon.indexOf('http') == -1) icon = Api.img(icon, 'w300')

                    let img_icon   = item.find('.notice__left img')[0] || {}
                    let img_author = item.find('.notice__author img')[0] || {}

                    img_icon.onload  = ()=>{
                        item.addClass('image--loaded')
                    }
                
                    img_icon.onerror = ()=>{
                        img_icon.src = './img/img_broken.svg'
                    }

                    img_author.onload  = ()=>{
                        item.addClass('image-author--loaded')
                    }
                
                    img_author.onerror = ()=>{
                        img_author.src = './img/img_broken.svg'
                    }

                    img_icon.src = Utils.fixProtocolLink(icon)

                    if(element.author) img_author.src = Utils.fixProtocolLink(author_data.img.indexOf('http') >= 0 ? author_data.img : Api.img(author_data.img, 'w200'))
                }
            })

            html.append(item)
        })

        if(!items.length){
            let empty = $('<div class="about"></div>')
                empty.append(viever.empty())

            html.append(empty)
        }

        viever.viewed()

        this.listener.send('viewed',{display: this.display})

        Modal.open({
            title: Lang.translate('title_notice'),
            select: html.find('.navigation-tabs .active')[0],
            size: 'medium',
            html: html,
            onBack: this.close.bind(this)
        })
    }

    count(){
        let all = 0

        for(let name in this.classes){
            if(this.classes[name].active()) all += this.classes[name].count()
        }

        return all
    }

    close(){
        Modal.close()

        Controller.toggle('head')
    }

    drawCount(){
        let status = Boolean(this.count())
        let icon   = $('.head .notice--icon')

        icon.toggleClass('active', status)

        clearInterval(this.blick_timer)

        if(status){
            this.blick_timer = setInterval(()=>{
                icon.addClass('animate')

                setTimeout(()=>{
                    icon.removeClass('animate')
                },1000)
            },1000*15)
        }
    }

    addClass(class_name, noticeClass){
        this.classes[class_name] = noticeClass
    }

    pushNotice(class_name, data, resolve, reject){
        if(this.classes[class_name] && this.classes[class_name].push){
            this.classes[class_name].push(data, resolve, reject)
        }
        else if(reject) reject('No find class')
    }
}

export default new Notice()