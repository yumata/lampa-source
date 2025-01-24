import Controller from '../interaction/controller'
import Reguest from '../utils/reguest'
import Scroll from '../interaction/scroll'
import Background from '../interaction/background'
import Activity from '../interaction/activity'
import Empty from '../interaction/empty'
import Lang from '../utils/lang'
import Template from '../interaction/template'
import Utils from '../utils/math'
import Explorer from '../interaction/explorer'
import Layer from '../utils/layer'
import Card from '../interaction/card'
import Arrays from '../utils/arrays'
import AI from '../utils/api/ai'

function Recommendations(object){
    let explorer = new Explorer(object)
    let network = new Reguest()
    let scroll  = new Scroll({mask: true, over: true, nopadding: true})
    let html    = $('<div></div>')
    let items   = []
    let last
    let active
    
    
    this.create = function(){
        this.activity.loader(false)

        explorer.render().find('.explorer__files-head').remove()

        explorer.appendFiles(scroll.render(true))

        scroll.append(html)

        scroll.minus()

        this.loading()

        AI.recommendations(object.movie.id, object.movie.name ? 'tv' : 'movie', this.build.bind(this), this.empty.bind(this))

        return this.render()
    }

    this.loading = function(){
        let ico = Template.get('icon_card', {}, true)

        let tpl = Template.get('ai_search_animation',{
            icon: ico
        })

        let box = $('<div class="ai-box-scroll layer--wheight"></div>')

        box.append(tpl)

        scroll.append(box)
    }

    this.empty = function(event){
        let code = network.errorCode(event)
        let text = {
            title: Lang.translate('network_error'),
            descr: Lang.translate('subscribe_noinfo')
        }

        if(code == 600){
            text.title  = Lang.translate('ai_subscribe_title')
            text.descr  = Lang.translate('ai_subscribe_descr')
            text.noicon = true
            text.width  = 'medium'
        }
        if(code == 345){
            text.title = Lang.translate('account_login_failed')
            text.descr = Lang.translate('account_login_wait')
        }
        if(code == 245){
            text.descr = event.message || Lang.translate('subscribe_noinfo')
        }

        scroll.clear()

        let empty = new Empty(text)

        empty.onLeft = ()=>{
            explorer.toggle()
        }

        empty.render().addClass('layer--wheight')

        html.append(empty.render())

        scroll.append(html)

        this.start = empty.start.bind(empty)

        this.activity.toggle()
    }


    this.build = function(data){
        try{
            scroll.render(true).removeClass('scroll--nopadding')

            scroll.clear()

            html.addClass('category-full')

            scroll.onScroll = this.limit.bind(this)
            scroll.onWheel  = (step)=>{
                if(!Controller.own(this)) this.start()

                if(step > 0) Navigator.move('down')
                else Navigator.move('up')
            }

            this.draw(data.results)

            scroll.append(html)

            this.limit()

            this.activity.toggle()
        }
        catch(e){
            this.empty({status: 245, message: e.message})
        }
    }

    this.draw = function(results){
        results.forEach(element => {
            let card = new Card(element, {
                object: object,
                card_explorer: true
            })
            
            card.create()
            card.onFocus = (target, card_data)=>{
                last = target

                active = items.indexOf(card)

                scroll.update(card.render(true))

                Background.change(Utils.cardImgBackground(card_data))
            }
            
            card.onTouch = (target, card_data)=>{
                last = target

                active = items.indexOf(card)
            }

            card.onEnter = (target, card_data)=>{
                last = target
                
                Activity.push({
                    url: card_data.url,
                    component: 'full',
                    id: element.id,
                    method: card_data.name ? 'tv' : 'movie',
                    card: element,
                    source: element.source || object.source
                })
            }

            html.append(card.render(true))

            items.push(card)
        })
    }

    this.limit = function(){
        let limit_view = 12
        let lilit_collection = 36

        let colection = items.slice(Math.max(0,active - limit_view), active + limit_view)

        items.forEach(item=>{
            if(colection.indexOf(item) == -1){
                item.render(true).classList.remove('layer--render')
            }
            else{
                item.render(true).classList.add('layer--render')
            }
        })

        Navigator.setCollection(items.slice(Math.max(0,active - lilit_collection), active + lilit_collection).map(c=>c.render(true)))
        Navigator.focused(last)

        Layer.visible(scroll.render(true))
    }


    this.start = function(){
        if(Activity.active().activity !== this.activity) return

        Background.immediately(Utils.cardImgBackgroundBlur(object.movie))
        
        Controller.add('content',{
            link: this,
            invisible: true,
            toggle: ()=>{
                Controller.collectionSet(scroll.render(true))
                Controller.collectionFocus(last || false,scroll.render(true))
            },
            left: ()=>{
                if(Navigator.canmove('left')) Navigator.move('left')
                else explorer.toggle()
            },
            right: ()=>{
                Navigator.move('right')
            },
            up: ()=>{
                if(Navigator.canmove('up')) Navigator.move('up')
                else Controller.toggle('head')
            },
            down: ()=>{
                if(Navigator.canmove('down')) Navigator.move('down')
            },
            back: ()=>{
                Activity.backward()
            }
        })

        Controller.toggle('content')
    }

    this.pause = function(){
        
    }

    this.stop = function(){
        
    }

    this.render = function(){
        return explorer.render()
    }

    this.destroy = function(){
        network.clear()

        Arrays.destroy(items)

        scroll.destroy()

        html.remove()

        items = []
    }
}

export default Recommendations