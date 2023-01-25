import Subscribe from '../../utils/subscribe'
import Controller from '../../interaction/controller'
import Arrays from '../../utils/arrays'
import Line from '../../interaction/items/line'
import Lang from '../../utils/lang'
import Storage from '../../utils/storage'
import Layer from '../../utils/layer'

function create(source){
    let timer,
        html = $('<div></div>'),
        items = [],
        active = 0,
        query

    this.listener = Subscribe()

    this.create = function(){
        this.empty()
    }

    this.empty = function(){
        html.empty().append($('<div class="search-looking"><div class="search-looking__text">'+Lang.translate(query ? 'search_nofound' : 'search_start_typing')+'</div></div>'))
    }

    this.loading = function(){
        this.listener.send('start')

        html.empty().append($('<div><div class="broadcast__text">'+Lang.translate('search_searching')+'</div><div class="broadcast__scan"><div></div></div></div>'))
    }

    this.cancel = function(){
        if(source.onCancel) source.onCancel()
    }

    this.search = function(value, immediately){
        clearTimeout(timer)

        if(value.length >= 2){
            timer = setTimeout(()=>{
                if(query == value) return

                query = value

                this.loading()

                source.search({query: encodeURIComponent(value)},(data)=>{
                    this.clear()

                    if(data.length > 0){
                        html.empty()

                        data.forEach(this.build.bind(this))

                        //Layer.visible(html)
                    }

                    this.listener.send('finded',{count: data.length})
                })
            },immediately ? 10 : 2500)
        }
        else{
            query = value

            this.clear()
        }
    }

    this.build = function(data){
        data.noimage = true

        source.params.card_view = 6

        let line = new Line(data,source.params)

        line.onDown = this.down.bind(this)
        line.onUp   = this.up.bind(this)
        line.onBack = this.back.bind(this)
        line.onLeft = ()=>{}

        line.onMore = ()=>{
            if(source.onMore) source.onMore({data, line, query}, ()=>{
                this.listener.send('select')
            })
        }

        if(source.onSelect){
            line.onSelect = (e, element)=>{
                source.onSelect({data, line, query, element},()=>{
                    this.listener.send('back')
                })
            }
        }
        else{
            line.onEnter = ()=>{
                this.listener.send('select')
            }
        }

        if(source.onRender) source.onRender(line)
        if(source.onAppend) line.onAppend = source.onAppend

        line.create()

        items.push(line)

        html.append(line.render())
    }

    this.any = function(){
        return items.length
    }

    this.back = function(){
        this.listener.send('back')
    }

    this.down = function(){
        active++

        active = Math.min(active, items.length - 1)

        items[active].toggle()

        this.listener.send('toggle',{element: items[active].render()})
    }

    this.up = function(){
        active--

        if(active < 0) this.listener.send('up')

        if(active < 0){
            active = 0
        }
        else{
            items[active].toggle()

            this.listener.send('toggle',{element: items[active].render()})
        }
    }

    this.clear = function(){
        this.empty()

        active = 0

        Arrays.destroy(items)

        items = []
    }

    this.toggle = function(){
        Controller.add('search_results',{
            invisible: true,
            toggle: ()=>{
                Controller.collectionSet(html)

                if(items.length){
                    items[active].toggle()

                    this.listener.send('toggle',{element: items[active].render()})
                } 
            },
            back: ()=>{
                this.listener.send('back')
            }
        })

        Controller.toggle('search_results')
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        clearTimeout(timer)

        this.clear()

        this.listener.destroy()
    }
}

export default create