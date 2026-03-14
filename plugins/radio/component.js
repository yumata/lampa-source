import Line from './line'

function component(){
    let network = new Lampa.Reguest()
    let scroll  = new Lampa.Scroll({mask:true,over: true})
    let items   = []
    let html    = $('<div></div>')
    let active  = 0

    this.create = function(){
        this.activity.loader(true)

        let prox  = Lampa.Platform.is('webos') || Lampa.Platform.is('tizen') || Lampa.Storage.field('proxy_other') === false ? '' : ''

        network.native(prox + 'https://www.radiorecord.ru/api/stations/',this.build.bind(this),()=>{
            let empty = new Lampa.Empty()

            html.append(empty.render())

            this.start = empty.start.bind(empty)

            this.activity.loader(false)

            this.activity.toggle()
        })

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

    this.background = function(){
        Lampa.Background.immediately('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAZCAYAAABD2GxlAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHASURBVHgBlZaLrsMgDENXxAf3/9XHFdXNZLm2YZHQymPk4CS0277v9+ffrut62nEcn/M8nzb69cxj6le1+75f/RqrZ9fatm3F9wwMR7yhawilNke4Gis/7j9srQbdaVFBnkcQ1WrfgmIIBcTrvgqqsKiTzvpOQbUnAykVW4VVqZXyyDllYFSKx9QaVrO7nGJIB63g+FAq/xhcHWBYdwCsmAtvFZUKE0MlVZWCT4idOlyhTp3K35R/6Nzlq0uBnsKWlEzgSh1VGJxv6rmpXMO7EK+XWUPnDFRWqitQFeY2UyZVryuWlI8ulLgGf19FooAUwC9gCWLcwzWPb7Wa60qdlZxjx6ooUuUqVQsK+y1VoAJyBeJAVsLJeYmg/RIXdG2kPhwYPBUQQyYF0XC8lwP3MTCrYAXB88556peCbUUZV7WccwkUQfCZC4PXdA5hKhSVhythZqjZM0J39w5m8BRadKAcrsIpNZsLIYdOqcZ9hExhZ1MH+QL+ciFzXzmYhZr/M6yUUwp2dp5U4naZDwAF5JRSefdScJZ3SkU0nl8xpaAy+7ml1EqvMXSs1HRrZ9bc3eZUSXmGa/mdyjbmqyX7A9RaYQa9IRJ0AAAAAElFTkSuQmCC')
    }

    this.start = function(){
        if(Lampa.Activity.active().activity !== this.activity) return

        this.background()

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