import Line from './line'

function component(){
    let network = new Lampa.Reguest()
    let scroll  = new Lampa.Scroll({mask:true,over: true})
    let items   = []
    let html    = $('<div></div>')
    let active  = 0

    this.create = function(){
        this.activity.loader(true)

        let prox  = Lampa.Platform.is('webos') || Lampa.Platform.is('tizen') || Lampa.Storage.field('proxy_other') === false ? '' : 'http://proxy.cub.watch/cdn/'

        network.native(prox + 'http://www.radiorecord.ru/api/stations/',this.build.bind(this),()=>{
            let empty = new Lampa.Empty()

            html.append(empty.render())

            this.start = empty.start

            this.activity.loader(false)

            this.activity.toggle()
        })

        Lampa.Background.immediately('')

        return this.render()
    }

    this.build = function(data){
        scroll.minus()

        html.append(scroll.render())

        data.result.genre.forEach(element => {
            let results = data.result.stations.filter(station=>{
                return station.genre.filter(genre=>genre.id == element.id).length
            })

            this.append({
                title: element.name,
                results: results
            })
        })

        this.activity.loader(false)

        this.activity.toggle()
    }

    this.append = function(element){
        let item = new Line(element)

        item.create()

        item.onDown  = this.down.bind(this)
        item.onUp    = this.up.bind(this)
        item.onBack  = this.back.bind(this)

        scroll.append(item.render())

        items.push(item)
    }

    this.back = function(){
        Lampa.Activity.backward()
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

            Lampa.Controller.toggle('head')
        }
        else{
            items[active].toggle()
        }

        scroll.update(items[active].render())
    }

    this.start = function(){
        Lampa.Controller.add('content',{
            toggle: ()=>{
                if(items.length){
                    items[active].toggle()
                }
            },
            back: this.back
        })

        Lampa.Controller.toggle('content')
    }

    this.pause = function(){
        
    }

    this.stop = function(){
        
    }

    this.render = function(){
        return html
    }

    this.destroy = function(){
        network.clear()

        Lampa.Arrays.destroy(items)

        scroll.destroy()

        html.remove()

        items = null
        network = null
    }
}

export default component