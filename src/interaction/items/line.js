import Template from '../template'
import Scroll from '../scroll'
import Controller from '../controller'
import Card from '../card'
import Layer from '../../utils/layer'
import Activity from '../activity'
import Background from '../background'
import More from '../more'
import Arrays from '../../utils/arrays'
import Utils from '../../utils/math'
import Storage from '../../utils/storage'

function create(data, params = {}){
    let content = Template.get('items_line',{title: data.title})
    
    let body    = content.find('.items-line__body')
    let scroll  = new Scroll({horizontal:true, step: params.wide ? 600 : 300})
    let viewall = Storage.field('card_views_type') == 'view' || Storage.field('navigation_type') == 'mouse'
    let items   = []
    let active  = 0
    let more
    let last

    this.create = function(){
        scroll.render().find('.scroll__body').addClass('items-cards')

        content.find('.items-line__title').text(data.title)

        this.bind()

        body.append(scroll.render())
    }

    this.bind = function(){
        data.results.slice(0,viewall ? data.results.length : 8).forEach(this.append.bind(this))

        if((data.results.length >= 20 || data.more) && !params.nomore) this.more()

        this.visible()

        Layer.update()
    }

    this.append = function(element){
        if(element.ready) return

        element.ready = true

        let card = new Card(element, params)
            card.create()

            card.onFocus = (target, card_data)=>{
                last = target

                active = items.indexOf(card)

                if(!viewall) data.results.slice(0,active + 5).forEach(this.append.bind(this))

                if(more){
                    more.render().detach()

                    scroll.append(more.render())
                }

                scroll.update(items[active].render(), params.align_left ? false : true)

                this.visible()

                if(!data.noimage) Background.change(Utils.cardImgBackground(card_data))

                if(this.onFocus) this.onFocus(card_data)
            }

            card.onEnter = (target, card_data)=>{
                if(this.onEnter)   this.onEnter(target, card_data)
                if(this.onPrevent) return this.onPrevent(target, card_data)

                if(!element.source) element.source = params.object.source

                Activity.push({
                    url: element.url,
                    component: 'full',
                    id: element.id,
                    method: card_data.name ? 'tv' : 'movie',
                    card: element,
                    source: element.source || params.object.source
                })
            }

            if(params.card_events){
                for(let i in params.card_events){
                    card[i] = params.card_events[i]
                }
            }

            scroll.append(card.render())

        items.push(card)
    }

    this.more = function(){
        more = new More(params)
        more.create()

        let onmore = ()=>{
            if(this.onEnter) this.onEnter()

            if(this.onMore){
                this.onMore()
            }
            else{
                Activity.push({
                    url: data.url,
                    title: 'Категория',
                    component: 'category_full',
                    page: 2,
                    genres: params.genres,
                    filter: data.filter,
                    source: params.object.source
                })
            }
        }

        more.onFocus = (target)=>{
            last = target

            scroll.update(more.render(), params.align_left ? false : true)

            if(this.onFocusMore) this.onFocusMore()
        }

        more.onEnter = ()=>{
            onmore()
        }

        let button = $('<div class="items-line__more selector">Еще</div>')

        button.on('hover:enter',()=>{
            onmore()
        })

        content.find('.items-line__head').append(button)

        scroll.append(more.render())
    }

    this.visible = function(){
        let vis = items

        if(!viewall) vis = items.slice(active, active + 8)

        vis.forEach(item => {
            item.visible()
        })
    }

    this.toggle = function(){
        Controller.add('items_line',{
            toggle: ()=>{
                Controller.collectionSet(scroll.render())
                Controller.collectionFocus(items.length ? last : false,scroll.render())

                this.visible()
            },
            right: ()=>{
                Navigator.move('right')

                Controller.enable('items_line')
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

    this.render = function(){
        return content
    }

    this.destroy = function(){
        Arrays.destroy(items)

        scroll.destroy()

        content.remove()

        if(more) more.destroy()

        items = null

        more = null
    }
}

export default create