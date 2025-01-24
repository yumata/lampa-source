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
import Cache from '../utils/cache'
import Layer from '../utils/layer'
import Ai from '../utils/api/ai'

function Facts(object){
    let explorer = new Explorer(object)
    let network = new Reguest()
    let scroll  = new Scroll({mask: true, over: true, nopadding: true})
    let html    = $('<div class="torrent-list"></div>')
    let cache   = 'facts_' + object.movie.id + '_' + (object.movie.name ? 'tv' : 'movie')
    
    
    this.create = function(){
        this.activity.loader(false)

        explorer.render().find('.explorer__files-head').remove()

        explorer.appendFiles(scroll.render(true))

        scroll.append(html)

        scroll.minus()

        let text_cache = ''

        Lampa.Cache.getData('other', cache).then((text)=>{
            text_cache = text
        }).finally(()=>{
            if(text_cache){
                this.build(text_cache)
            }
            else{
                this.loading()

                Layer.update()

                Ai.facts(object.movie.id, object.movie.name ? 'tv' : 'movie', (data)=>{
                    Cache.rewriteData('other', cache, data.text).finally(()=>{})

                    this.build(data.text)
                }, this.empty.bind(this))
            }
        })

        return this.render()
    }

    this.loading = function(){
        let ico = Template.get('icon_text', {}, true)

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
        if(code == 347){
            text.title = Lang.translate('empty_title_two')
            text.descr = Lang.translate('empty_text_two')
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


    this.build = function(text){
        try{
            let md = window.markdownit()

            html.html(md.render(text))

            html.find('h1').remove()

            html.addClass('text-markdow')

            scroll.render(true).removeClass('scroll--nopadding')

            scroll.clear()

            scroll.append(html)

            html.addClass('animate-up-content animate-opacity')

            this.activity.toggle()
        }
        catch(e){
            this.empty({status: 245, message: e.message})
        }
    }


    this.start = function(){
        if(Activity.active().activity !== this.activity) return

        Background.immediately(Utils.cardImgBackgroundBlur(object.movie))
        
        Controller.add('content',{
            link: this,
            invisible: true,
            toggle: ()=>{
                Controller.collectionSet(scroll.render(true))
                Controller.collectionFocus(false,scroll.render(true))
            },
            left: ()=>{
                explorer.toggle()
            },
            up: ()=>{
                if(scroll.position() == 0) Controller.toggle('head')
                else scroll.wheel(-150)
            },
            down: ()=>{
                scroll.wheel(150)
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

        scroll.destroy()

        html.remove()
    }
}

export default Facts