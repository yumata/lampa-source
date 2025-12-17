import Subscribe from '../../utils/subscribe'
import Controller from '../../core/controller'
import Arrays from '../../utils/arrays'
import Line from '../items/line'
import LineModule from '../items/line/module/module'
import Lang from '../../core/lang'
import Cache from '../../utils/cache'
import Router from '../../core/router'
import Utils from '../../utils/utils'
import Template from '../template'

function Results(source){
    let timer,
        html   = Template.elem('div'),
        items  = [],
        active = 0,
        query

    let source_name = 'search_' + source.title.toLowerCase()

    this.listener = Subscribe()
    this.params   = source.params

    this.create = function(){
        this.empty()
    }

    this.recall = function(last_query){
        Cache.getData('other', source_name + '_' + (last_query || 'last'), 60 * 24).then((data)=>{
            if(!data) return

            this.clear()
            
            html.empty()

            source.onRecall && source.onRecall(data, last_query)

            data.forEach(this.build.bind(this))

            this.listener.send('finded',{count: this.count(data), data})
        }).catch(()=>{})
    }

    this.empty = function(){
        html.empty().append($('<div class="search-looking"><div class="search-looking__text">'+Lang.translate(query ? (source.params.nofound || 'search_nofound') : (source.params.start_typing || 'search_start_typing'))+'</div></div>'))
    }

    this.loading = function(){
        this.listener.send('start')

        html.empty().append($('<div><div class="broadcast__text">'+Lang.translate('search_searching')+'</div><div class="broadcast__scan"><div></div></div></div>'))
    }

    this.cancel = function(){
        clearTimeout(timer)

        if(source.onCancel) source.onCancel()
    }

    this.search = function(value, immediately){
        clearTimeout(timer)

        if(value.length >= 3){
            timer = setTimeout(()=>{
                if(query == value) return

                query = value

                this.loading()

                source.search({query: encodeURIComponent(value)},(data)=>{
                    this.clear()

                    this.dmca(data)

                    let count = this.count(data)

                    if(count > 0){
                        html.empty()

                        let copy = Arrays.clone(data)

                        Cache.rewriteData('other', source_name + '_' + value, copy).catch(()=>{})
                        Cache.rewriteData('other', source_name + '_last', copy).catch(()=>{})

                        data.forEach(this.build.bind(this))
                    }
                    else this.empty()

                    this.listener.send('finded',{count, data})
                })
            },immediately ? 10 : 2500)
        }
        else{
            query = value

            this.clear()

            if(!value) this.recall('')
        }
    }

    this.count = function(result){
        let count = 0

        result.forEach((data)=>{
            count += data.results.length
        })

        return count
    }

    this.dmca = function(result){
        if(Arrays.isArray(window.lampa_settings.dcma)){
            result.forEach((data)=>{
                data.results = data.results.filter((item)=>{
                    return !window.lampa_settings.dcma.find((b)=>b.id == item.id && b.cat == (item.name ? 'tv' : 'movie'))
                })
            })
        }
    }

    this.build = function(data){
        data.noimage = true

        source.params.card_view = 6

        if(Arrays.isArray(window.lampa_settings.dcma)){
            data.results = data.results.filter((item)=>{
                return !window.lampa_settings.dcma.find((b)=>b.id == item.id && b.cat == (item.name ? 'tv' : 'movie'))
            })
        }

        let line = Utils.createInstance(Line, data, {
            ...source.params,
            module: LineModule.only('Items', 'Create', 'More')
        })

        line.use({
            onDown: this.down.bind(this),
            onUp: this.up.bind(this),
            onBack: this.back.bind(this),
            onMore: ()=>{
                if(source.onMore) source.onMore({data, line, query}, ()=>{
                    this.listener.send('select')
                })
            },
            onInstance: (item, item_data)=>{
                item.use({
                    onEnter: ()=>{
                        if(source.onSelect){
                            source.onSelect({data, line, query, element: item_data, item_data},()=>{
                                this.listener.send('select')
                            })
                        }
                        else{
                            this.listener.send('select')

                            Router.call('full', item_data)
                        }
                    }
                })
            }
        })

        if(source.onRender) source.onRender(line)

        line.create()

        items.push(line)

        html.append(line.render(true))
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

        this.listener.send('clear')
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

    this.render = function(js){
        return js ? html : $(html)
    }

    this.destroy = function(){
        clearTimeout(timer)

        this.clear()

        this.listener.destroy()
    }
}

export default Results