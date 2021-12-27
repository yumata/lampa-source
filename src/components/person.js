import Controller from '../interaction/controller'
import Reguest from '../utils/reguest'
import Scroll from '../interaction/scroll'
import Start from './person/start'
import Line from '../interaction/items/line'
import Api from '../interaction/api'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'
import Empty from '../interaction/empty'

let components = {
    start: Start,
    line: Line
}

function component(object){
    let network = new Reguest()
    let scroll  = new Scroll({mask:true,over:true})
    let items   = []
    let active  = 0

    scroll.render().addClass('layer--wheight')

    this.create = function(){
        this.activity.loader(true)

        Api.person(object,(data)=>{
            this.activity.loader(false)

            if(data.person){
                this.build('start', data.person);

                if(data.credits && data.credits.knownFor && data.credits.knownFor.length > 0) {
                    for (let i = 0; i < Math.min(data.credits.knownFor.length, 3); i++) {
                        const departament = data.credits.knownFor[i];
                        this.build('line', {
                            title: departament.name,
                            noimage: true,
                            results: departament.credits,
                        })
                    }
                } else {
                    //для обратной совместимости с иви и окко
                    if(data.movie && data.movie.results.length){
                        data.movie.title   = 'Фильмы'
                        data.movie.noimage = true

                        this.build('line', data.movie)
                    }

                    if(data.tv && data.tv.results.length){
                        data.tv.title   = 'Сериалы'
                        data.tv.noimage = true

                        this.build('line', data.tv)
                    }
                }

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

    this.build = function(name, data){
        let item = new components[name](data,{object:object,nomore:true})

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