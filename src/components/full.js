import Controller from '../interaction/controller'
import Reguest from '../utils/reguest'
import Scroll from '../interaction/scroll'
import Start from '../components/full/start'
import Descr from '../components/full/descr'
import Persons from './full/persons'
import Line from '../interaction/items/line'
import Api from '../interaction/api'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'
import Empty from '../interaction/empty'
import Reviews from './full/reviews'

let components = {
    start: Start,
    descr: Descr,
    persons: Persons,
    recomend: Line,
    simular: Line,
    comments: Reviews
}

function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over:true})
    let items   = []
    let active  = 0

    scroll.render().addClass('layer--wheight')

    this.create = function(){
        this.activity.loader(true)

        Api.full(object,(data)=>{
            this.activity.loader(false)

            if(data.movie){
                Lampa.Listener.send('full',{type:'start',object,data})

                this.build('start', data)
                this.build('descr', data)

                if(data.persons && data.persons.crew && data.persons.crew.length) {
                    const directors = data.persons.crew.filter(member => member.job === 'Director');
                    if(directors.length) {
                        this.build('persons', directors, {title: 'Режиссер'});
                    }
                }
                if(data.persons && data.persons.cast && data.persons.cast.length) this.build('persons', data.persons.cast)

                if(data.comments && data.comments.length) this.build('comments', data)

                if(data.recomend && data.recomend.results.length){
                    data.recomend.title   = 'Рекомендации'
                    data.recomend.noimage = true

                    this.build('recomend', data.recomend)
                }

                if(data.simular && data.simular.results.length){
                    data.simular.title   = 'Похожие'
                    data.simular.noimage = true

                    this.build('simular', data.simular)
                }

                Lampa.Listener.send('full',{type:'complite',object,data})

                this.activity.toggle()
            }
            else{
                this.empty()
            }
        },this.empty.bind(this))

        return this.render()
    }

    this.empty = function(){
        let empty = new Empty()

        scroll.append(empty.render())

        this.start = empty.start

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.build = function(name, data, params){
        let item = new components[name](data, {object: object, nomore: true, ...params})

        item.onDown = this.down
        item.onUp   = this.up
        item.onBack = this.back

        item.create()

        items.push(item)

        scroll.append(item.render())
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

            Controller.toggle('head')
        }
        else{
            items[active].toggle()
        }

        scroll.update(items[active].render())
    }

    this.back = function(){
        Activity.backward()
    }

    this.start = function(){
        Controller.add('content',{
            toggle: ()=>{
                if(items.length){
                    items[active].toggle()
                }
            }
        })

        Controller.toggle('content')
    }

    this.pause = function(){
        
    }

    this.stop = function(){
        
    }

    this.render = function(){
        return scroll.render()
    }

    this.destroy = function(){
        network.clear()

        Arrays.destroy(items)

        scroll.destroy()

        items = null
        network = null
    }
}

export default component