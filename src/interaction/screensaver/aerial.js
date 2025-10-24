import Template from '../template'
import Utils from '../../utils/utils'
import Storage from '../../core/storage/storage'
import Network from '../../utils/reguest'

class Aerial{
    constructor(params){
        this.params  = params

        this.net = new Network()
        this.visible = false

        this.items = []
        this.opacity = 0

        this.transition_time = 4000
        this.transition_timeout
    }

    create(){
        this.html = Template.get('screensaver')

        this.preload = $('<div class="screensaver__preload"></div>')

        this.video = $('<video class="screensaver__video" muted="" preload=""></video>')[0]

        this.overlay = $('<div class="screensaver__video-overlay"></div>')

        this.video.addEventListener('timeupdate', ()=>{
            if(this.video.duration){
                let visible = this.video.currentTime > 0 && this.video.currentTime < this.video.duration - 5
                let points  = this.object.pointsOfInterest

                if(visible !== this.visible){
                    this.visible = visible

                    this.info.toggleClass('visible', visible)

                    if(this.visible) this.fadeVideoOut(this.transition_time)
                    else this.fadeVideoIn(this.transition_time)
                }

                if(this.video.currentTime == this.video.duration && !this.wait_load){
                    this.wait_load = true

                    this.select()

                    this.play()
                }

                if(points){
                    for(let time in points){
                        let text = points[time]

                        if(parseInt(time) <= this.video.currentTime && this.tagline.text_ready !== text){
                            this.tagline.text_ready = text

                            this.tagline.text(text)
                        }
                    }
                }
            }
        })

        this.info = $(`<div class="screensaver__title">
            <div class="screensaver__title-name"></div>
            <div class="screensaver__title-tagline"></div>
        </div>`)

        this.title = this.info.find('.screensaver__title-name')
        this.tagline = this.info.find('.screensaver__title-tagline')

        this.html.prepend(this.preload)
        this.html.prepend(this.overlay)
        this.html.prepend(this.video)

        this.html.find('.screensaver__slides').remove()
        this.html.find('.screensaver__gradient').after(this.info)

        this.time = Utils.time(this.html)
        this.time.tik()

        this.cache(()=>{
            this.select()

            this.play()
        })
    }

    select(){
        this.object = this.items[Math.floor(Math.random()*this.items.length)]

        this.title.text(this.object.name.replace(/\s\d$/,''))
        this.tagline.text(Utils.capitalizeFirstLetter(this.object.type))
    }

    fadeVideoIn(time) {
        if (time > 0) {
            this.transition_timeout = setTimeout(this.fadeVideoIn.bind(this), 16, time - 16)
        }

        this.opacity = 1 - (time / this.transition_time)

        this.overlay[0].style.opacity = this.opacity
    }

    fadeVideoOut(time) {
        if (time > 0) {
            this.transition_timeout = setTimeout(this.fadeVideoOut.bind(this), 16, time - 16)
        }

        this.opacity = time / this.transition_time

        this.overlay[0].style.opacity = this.opacity
    }

    play(){
        this.video.src = this.object.src.H2641080p.replace('https:','http:')

        this.video.load()

        let playPromise

        try{
            playPromise = this.video.play()
        }
        catch(e){ }

        let startPlay = ()=>{
            console.log('Screesaver','playing')

            this.preload.remove()

            this.wait_load = false
        }

        if (playPromise !== undefined) {
            playPromise.then(()=>startPlay())
            .catch((e)=>{
                console.log('Player','play promise error:', e.message)
            })
        }
        else startPlay()
    }

    cache(call){
        this.items = Storage.get('screensaver_aerial_items','[]')

        if(this.items.length) call()
        else{
            this.net.silent('https://raw.githubusercontent.com/OrangeJedi/Aerial/master/videos.json',(json)=>{
                this.items = json.filter(a=>a.src.H2641080p)

                Storage.set('screensaver_aerial_items',this.items)

                call()
            })
        }
    }

    render(){
        return this.html
    }

    destroy(){
        this.html.remove()

        this.net.clear()

        clearTimeout(this.transition_timeout)
    }
}

export default Aerial