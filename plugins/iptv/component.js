import Playlist from './playlist/main'
import Channels from './channels/main'

function Component(){
    let html = document.createElement('div')
    
    let listener
    let playlist
    let channels

    window.iptv_mobile = window.innerWidth < 768

    if(Lampa.Manifest.app_digital >= 185){
        listener = Lampa.Subscribe()
        playlist = new Playlist(listener)
        channels = new Channels(listener)
    }
    
    this.create = function(){
        this.activity.loader(true)

        if(Lampa.Manifest.app_digital >= 185){
            listener.follow('display',(controller)=>{
                this.active = controller

                this.display(controller.render())
            })

            listener.follow('loading',this.loading.bind(this))

            listener.follow('channels-load',channels.load.bind(channels))
            listener.follow('playlist-main',playlist.main.bind(playlist))

            playlist.load()
        }
        else{
            let old = Lampa.Template.get('cub_iptv_list')

            old.find('.iptv-list__title').text(Lampa.Lang.translate('iptv_update_app_title'))
            old.find('.iptv-list__text').text(Lampa.Lang.translate('iptv_update_app_text'))

            $(html).append(old)

            this.activity.loader(false)
        }

        if(window.iptv_mobile) html.addClass('iptv-mobile')

        return this.render() 
    }

    this.playlist = function(){
        playlist.main()
    }

    this.loading = function(){
        this.activity.loader(true)

        this.active = false

        this.start()
    }

    this.display = function(render){
        html.empty().append(render)

        Lampa.Layer.update(html)
        Lampa.Layer.visible(html)

        this.activity.loader(false)

        this.start()
    }

    this.background = function(){
        Lampa.Background.immediately('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAZCAYAAABD2GxlAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAHASURBVHgBlZaLrsMgDENXxAf3/9XHFdXNZLm2YZHQymPk4CS0277v9+ffrut62nEcn/M8nzb69cxj6le1+75f/RqrZ9fatm3F9wwMR7yhawilNke4Gis/7j9srQbdaVFBnkcQ1WrfgmIIBcTrvgqqsKiTzvpOQbUnAykVW4VVqZXyyDllYFSKx9QaVrO7nGJIB63g+FAq/xhcHWBYdwCsmAtvFZUKE0MlVZWCT4idOlyhTp3K35R/6Nzlq0uBnsKWlEzgSh1VGJxv6rmpXMO7EK+XWUPnDFRWqitQFeY2UyZVryuWlI8ulLgGf19FooAUwC9gCWLcwzWPb7Wa60qdlZxjx6ooUuUqVQsK+y1VoAJyBeJAVsLJeYmg/RIXdG2kPhwYPBUQQyYF0XC8lwP3MTCrYAXB88556peCbUUZV7WccwkUQfCZC4PXdA5hKhSVhythZqjZM0J39w5m8BRadKAcrsIpNZsLIYdOqcZ9hExhZ1MH+QL+ciFzXzmYhZr/M6yUUwp2dp5U4naZDwAF5JRSefdScJZ3SkU0nl8xpaAy+7ml1EqvMXSs1HRrZ9bc3eZUSXmGa/mdyjbmqyX7A9RaYQa9IRJ0AAAAAElFTkSuQmCC')
    }

    this.start = function(){
        if(Lampa.Activity.active() && Lampa.Activity.active().activity !== this.activity) return

        this.background()

        Lampa.Controller.add('content',{
            invisible: true,
            toggle: ()=>{
                if(this.active) this.active.toggle()
                else{
                    Lampa.Controller.collectionSet(html)
                    Lampa.Controller.collectionFocus(false,html)
                }
            },
            left: ()=>{
                Lampa.Controller.toggle('menu')
            },
            up: ()=>{
                Lampa.Controller.toggle('head')
            },
            back: ()=>{
                Lampa.Activity.backward()
            }
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
        playlist.destroy()
        channels.destroy()
        listener.destroy()

        html.remove()
    }
}

export default Component