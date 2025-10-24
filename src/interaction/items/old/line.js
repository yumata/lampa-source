import Template from '../../template'
import Scroll from '../../scroll'
import Controller from '../../../core/controller'
import Card from '../../card'
import Activity from '../../activity/activity'
import Background from '../../background'
import More from '../../more'
import Arrays from '../../../utils/arrays'
import Utils from '../../../utils/utils'
import Lang from '../../../core/lang'
import Layer from '../../../core/layer'
import Platform from '../../../core/platform'

function create(data, params = {}){
    let content = Template.js('items_line',{title: data.title})
    
    let body    = content.querySelector('.items-line__body')
    let scroll  = new Scroll({horizontal:true, step: params.card_wide ? 600 : 300})
    let items   = []
    let active  = 0
    let tv      = Platform.screen('tv')
    let view    = (tv ? (Lampa.Storage.field('interface_size') == 'small' ? 7 : 6) : 12) + (params.align_left ? 4 : 0)
    let more
    let last

    console.warn('Component InteractionLine is deprecated.')

    let onmore = ()=>{
        if(this.onEnter) this.onEnter()
        
        if(data.onMore) data.onMore(data)
        else if(this.onMore){
            this.onMore(data)
        }
        else{
            Activity.push({
                url: data.url,
                title: data.title || Lang.translate('title_category'),
                component: 'category_full',
                page: 1,
                genres: params.genres,
                filter: data.filter,
                source: data.source || params.object.source
            })
        }
    }

    this.event = function(type){
        Lampa.Listener.send('line',{
            line: this, 
            type, 
            params,
            data,
            scroll,
            body,
            items,
            active
        })
    }

    this.create = function(){
        this.event('create')

        scroll.body(true).addClass('items-cards mapping--line')

        content.querySelector('.items-line__title').innerHTML = data.title

        content.classList.add('items-line--type-' + (params.type || 'none'))

        content.addEventListener('visible',this.visible.bind(this))

        data.results.slice(0,view).forEach(this.append.bind(this))

        body.appendChild(scroll.render(true))

        scroll.onWheel = (step)=>{
            if(!Controller.own(this)) this.toggle()

            Controller.enabled().controller[step > 0 ? 'right' : 'left']()
        }

        scroll.onScroll = this.attach.bind(this)
    }

    /* 
    События
    
    this.onAppend    = function(){}
    this.onFocus     = function(){}
    this.onEnter     = function(){}
    this.onSelect    = function(){}
    this.onMore      = function(){}
    this.onFocusMore = function(){}
    this.onLeft      = function(){}
    this.onBack      = function(){}
    this.onDown      = function(){}
    this.onUp        = function(){}
    */

    this.visible = function(){
        data.results.slice(0,view).forEach(this.append.bind(this))

        if((data.results.length >= 20 || data.more) && !params.nomore){
            let button = document.createElement('div')
                button.classList.add('items-line__more')
                button.classList.add('selector')
                button.innerText = Lang.translate('more')

                button.addEventListener('hover:enter',onmore)

            content.querySelector('.items-line__head').appendChild(button)
        }

        this.event('visible')

        Layer.visible(scroll.render(true))
    }

    this.append = function(element){
        if(element.ready) return

        element.ready = true

        let card = params.cardClass ? params.cardClass(element, params) : element.cardClass ? element.cardClass(element, params) : new Card(element, params)
            card.create()

            card.onFocus = (target, card_data)=>{
                last = target

                let prev_active = active

                active = items.indexOf(card)

                if(active > 0 || prev_active > active) scroll.update(items[active].render(true), params.align_left ? false : true)

                if(!data.noimage) Background.change(Utils.cardImgBackground(card_data))

                if(this.onFocus) this.onFocus(card_data)
            }

            card.onEnter = (target, card_data)=>{
                last = target
                
                if(this.onEnter) this.onEnter(target, card_data)

                if(this.onSelect)  return this.onSelect(target, card_data)

                if(!card_data.source) card_data.source = params.object.source

                if(typeof card_data.gender !== 'undefined'){
                    Activity.push({
                        url: card_data.url,
                        title: Lang.translate('title_person'),
                        component: 'actor',
                        id: card_data.id,
                        source: card_data.source || params.object.source
                    })
                }
                else{
                    Activity.push({
                        url: card_data.url,
                        component: 'full',
                        id: card_data.id,
                        method: card_data.name ? 'tv' : 'movie',
                        card: card_data,
                        source: card_data.source || params.object.source
                    })
                }
            }

            card.onHover = (target, card_data)=>{
                if(this.onHover) this.onHover(card_data)
            }

            card.onVisible = ()=>{
                if(Controller.own(this)) Controller.collectionAppend(card.render(true))
            }

            if(this.onMenu) card.onMenu = this.onMenu

            if(params.card_events){
                for(let i in params.card_events){
                    card[i] = params.card_events[i]
                }
            }

        scroll.append(card.render(true))

        items.push(card)

        if(this.onAppend) this.onAppend(card)

        this.event('append')

        return card.render(true)
    }

    this.more = function(){
        more = new More(params)
        more.create()

        more.render(true).on('hover:focus', (target)=>{
            last = target

            active = items.indexOf(more)

            scroll.update(more.render(true), params.align_left ? false : true)

            if(this.onFocusMore) this.onFocusMore()
        })

        more.render(true).on('hover:enter', onmore.bind(this))

        scroll.append(more.render(true))

        more.size(items[items.length - 1].render(true))

        items.push(more)

        return more.render(true)
    }

    this.attach = function(){
        let size = tv ? (Math.round(active / view) + 1) * view + 1 : data.results.length

        data.results.slice(0, size).filter(e=>!e.ready).forEach(this.append.bind(this))

        if(!more && !params.nomore && data.results.length == data.results.filter(e=>e.ready).length && data.results.length >= 20){
            let more_item = this.more()

            if(Controller.own(this)) Controller.collectionAppend(more_item)
        }

        Layer.visible(scroll.render(true))
    }

    this.toggle = function(){
        Controller.add('items_line',{
            link: this,
            toggle: ()=>{
                Controller.collectionSet(scroll.render(true))
                Controller.collectionFocus(items.length ? last : false,scroll.render(true))

                if(this.onToggle) this.onToggle(this)

                this.event('toggle')
            },
            update: ()=>{

            },
            right: ()=>{
                Navigator.move('right')
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else if(this.onLeft) this.onLeft()
                else Controller.toggle('menu')
            },
            down:this.onDown,
            up: this.onUp,
            gone: ()=>{

            },
            back: this.onBack
        })

        Controller.toggle('items_line')
    }

    this.render = function(js){
        return js ? content : $(content)
    }

    this.destroy = function(){
        Arrays.destroy(items)

        scroll.destroy()

        content.remove()

        items = null

        this.event('destroy')
    }
}

export default create