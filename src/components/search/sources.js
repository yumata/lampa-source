import Subscribe from '../../utils/subscribe'
import Scroll from '../../interaction/scroll'
import Controller from '../../interaction/controller'
import Api from '../../interaction/api'
import Result from './results'
import Layer from '../../utils/layer'

let stop_keys = [
    'пор',
    'порн',
    'порно',
    'секс',
    'член',

    'por',
    'porn',
    'porno',
    'sex',
    'hot',
    'xxx'
]

function create(params = {}){
    let scroll,
        last,
        active,
        last_query = ''

    let html    = $('<div></div>'),
        results = []

    this.listener = Subscribe()

    this.create = function(){
        scroll = new Scroll({
            over: true,
            mask:false,
            horizontal: true
        })

        let sources = params.sources || Api.availableDiscovery()

        sources.forEach(this.build.bind(this))

        if(!params.sources){
            params.additional.forEach(this.build.bind(this))
        }

        this.enable(results[0])

        if(results.length < 2){
            scroll.render().addClass('hide')

            html.addClass('search__results-offset')
        }

        results.forEach(source=>{
            source.recall(last_query)
        })
    }

    this.enable = function(result){
        if(active) active.render().detach()

        active = result

        if(active.params.lazy && last_query) active.search(last_query,true)

        html.empty().append(result.render())

        scroll.render().find('.search-source').removeClass('active').eq(results.indexOf(result)).addClass('active')

        Layer.visible(result.render())
    }

    this.build = function(source){
        let tab    = $('<div class="search-source selector"><div class="search-source__tab">'+source.title+'</div><div class="search-source__count">0</div></div>')
        let result = new Result(source)
            result.create()

        if(source.params.lazy) tab.find('.search-source__count').remove()

        result.listener.follow('start',()=>{
            tab.addClass('search-source--loading')

            tab.find('.search-source__count').html('&nbsp;')
        })

        result.listener.follow('finded',(e)=>{
            tab.removeClass('search-source--loading')

            tab.find('.search-source__count').text(e.count)

            if(active == result) Layer.visible(result.render())

            this.listener.send('finded',{source, result, count: e.count, data: e.data})
        })

        result.listener.follow('up',(e)=>{
            if(results.length < 2) this.listener.send('up')
            else this.toggle()
        })

        result.listener.follow('select',this.listener.send.bind(this.listener,'select'))
        result.listener.follow('back',this.listener.send.bind(this.listener,'back'))

        result.listener.follow('toggle',(e)=>{
            this.listener.send('toggle',{source, result: e.result, element: e.element})
        })

        tab.on('hover:enter',()=>{
            this.enable(result)
        }).on('hover:focus',(e)=>{
            last = e.target

            scroll.update($(e.target))
        })

        scroll.append(tab)

        results.push(result)

        this.listener.send('create',{source, result})
    }


    this.toggle = function(from_search){
        Controller.add('search_sources',{
            toggle: ()=>{
                Controller.collectionSet(scroll.render())
                Controller.collectionFocus(last, scroll.render())

                if(from_search && results.length < 2 && active.any()) active.toggle()
            },
            update: ()=>{},
            up: ()=>{
                this.listener.send('up')
            },
            down: ()=>{
                if(active.any()) active.toggle()
            },
            right: ()=>{
                Navigator.move('right')
            },
            left: ()=>{
                Navigator.move('left')
            },
            back: ()=>{
                this.listener.send('back')
            }
        })

        Controller.toggle('search_sources')
    }

    this.search = function(query, immediately){
        results.forEach(result => result.cancel())

        if(!stop_keys.find(k=>k == query.toLowerCase())){
            last_query = query

            this.listener.send('search',{query, immediately})

            results.forEach(result => {
                if(!result.params.lazy || active === result) result.search(query, immediately)
            })
        }
    }

    this.cancel = function(){
        results.forEach(result => result.cancel())
    }

    this.tabs = function(){
        return scroll.render()
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        scroll.destroy()

        results.forEach(result => result.cancel())

        this.listener.destroy()
    }
}

export default create