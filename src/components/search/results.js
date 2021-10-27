import Subscribe from '../../utils/subscribe'
import Scroll from '../../interaction/scroll'
import Controller from '../../interaction/controller'
import Api from '../../interaction/api'
import Arrays from '../../utils/arrays'
import Line from '../../interaction/items/line'
import Activity from '../../interaction/activity'

function create(){
    let scroll,
        timer,
        last,
        items = [],
        active = 0,
        query

    this.listener = Subscribe()

    this.create = function(){
        scroll = new Scroll({over: true})
    }

    this.search = function(value){
        clearTimeout(timer)

        query = value

        timer = setTimeout(()=>{
            Api.search({query: encodeURIComponent(value)},(data)=>{
                this.clear()

                if(data.movie && data.movie.results.length) this.build(data.movie,'movie')
                if(data.tv && data.tv.results.length)    this.build(data.tv,'tv')

                Controller.enable('search_results')
            })
        },1000)
    }

    this.build = function(data, type){
        data.noimage = true
        
        let item = new Line(data,{
            align_left: true,
            object: {
                source: 'tmdb'
            }
        })

        item.onDown = this.down
        item.onUp   = this.up
        item.onBack = this.back.bind(this)
        item.onLeft = ()=>{
            this.listener.send('left')
        }
        item.onEnter = ()=>{
            this.listener.send('enter')
        }
        item.onMore = ()=>{
            Activity.push({
                url: 'search/' + type,
                title: 'Поиск - ' + query,
                component: 'category_full',
                page: 2,
                query: encodeURIComponent(query),
                source: 'tmdb'
            })
        }

        item.create()

        items.push(item)

        scroll.append(item.render())
    }

    this.back = function(){
        this.listener.send('back')
    }

    this.down = function(){
        active++

        active = Math.min(active, items.length - 1)

        items[active].toggle()

        scroll.update(items[active].render())
    }

    this.up = function(){
        active--

        if(active < 0){
            active = 0
        }
        else{
            items[active].toggle()
        }

        scroll.update(items[active].render())
    }

    this.clear = function(){
        scroll.reset()

        active = 0

        Arrays.destroy(items)

        items = []
    }

    this.toggle = function(){
        Controller.add('search_results',{
            invisible: true,
            toggle: ()=>{
                Controller.collectionSet(scroll.render())

                if(items.length){
                    active = 0

                    scroll.update(items[0].render())

                    items[0].toggle()
                } 
            },
            back: ()=>{
                this.listener.send('back')
            },
            left: ()=>{
                this.listener.send('left')
            }
        })

        Controller.toggle('search_results')
    }

    this.render = function(){
        return scroll.render()
    }

    this.destroy = function(){
        clearTimeout(timer)

        this.clear()

        scroll.destroy()

        this.listener.destroy()
    }
}

export default create