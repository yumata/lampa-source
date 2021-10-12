import Controller from '../interaction/controller'
import Reguest from '../utils/reguest'
import Scroll from '../interaction/scroll'
import Start from '../components/full/start'
import Descr from '../components/full/descr'
import Actors from '../components/full/actors'
import Line from '../interaction/items/line'
import Api from '../interaction/api'
import Activity from '../interaction/activity'
import Arrays from '../utils/arrays'
import Background from '../interaction/background'
import Utils from '../utils/math'

let components = {
    start: Start,
    descr: Descr,
    actors: Actors,
    recomend: Line,
    simular: Line
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
                this.build('start', data)
                this.build('descr', data)

                if(data.actors && data.actors.cast && data.actors.cast.length) this.build('actors', data)
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

                Background.change(Utils.cardImgBackground(data.movie))

                this.activity.toggle()
            }
            else{

            }
        },()=>{

        })

        return this.render()
    }

    this.build = function(name, data){
        let item = new components[name](data, {object: object})

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