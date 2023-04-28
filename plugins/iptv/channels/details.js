import Api from '../utils/api'
import Utils from '../utils/utils'
import EPG from '../utils/epg'

class Details{
    constructor(listener){
        this.listener = listener

        this.html   = Lampa.Template.js('cub_iptv_details')
        this.title  = this.html.find('.iptv-details__title')
        this.play   = this.html.find('.iptv-details__play')
        this.progm  = this.html.find('.iptv-details__program')

        this.empty_html = Lampa.Template.js('cub_iptv_details_empty')

        this.listener.follow('details-load',this.draw.bind(this))

        if(window.iptv_mobile) this.html.removeClass('layer--wheight')

        this.timer = setInterval(()=>{
            if(this.timeline) this.timeline()
        },1000 * 5)
    }

    draw(channel){
        this.title.text(Utils.clear(channel.name))
        this.play.text(channel.group || Lampa.Lang.translate('player_unknown'))

        this.wait_for = channel.name

        if(channel.id){
            this.progm.text(Lampa.Lang.translate('loading')+'...')

            Api.program({
                channel_id: channel.id,
                time: EPG.time(channel)
            }).then((program)=>{
                if(this.wait_for == channel.name){
                    if(program.length) this.program(channel, program)
                    else this.empty()
                }
            }).catch(()=>{
                this.empty()
            })
        }
        else{
            this.empty()
        }
    }

    empty(){
        this.timeline = false

        this.progm.empty().append(this.empty_html)
    }

    program(channel, program){
        if(this.endless) this.endless.destroy()

        this.timeline = false

        let start = EPG.position(channel, program)

        if(program[start]) this.play.text(Lampa.Utils.shortText(Utils.clear(program[start].title),50))

        this.endless = new Lampa.Endless((position)=>{
            if(position >= program.length) return this.endless.to(position-1)

            let wrap = document.createElement('div')
            let list = EPG.list(channel, program, 10, position)

            list.forEach((elem, index)=>{
                let item = document.createElement('div')

                if(elem.type == 'date') item.addClass('iptv-program-date').text(elem.date)
                else{
                    item.addClass('iptv-program selector')

                    let time = document.createElement('div')
                        time.addClass('iptv-program__time').text(Lampa.Utils.parseTime(elem.program.start).time)

                    let body = document.createElement('div')
                        body.addClass('iptv-program__body')

                    let title = document.createElement('div')
                        title.addClass('iptv-program__title').text(Utils.clear(elem.program.title))

                        body.append(title)
                        
                    
                    if(elem.watch){
                        let timeline = document.createElement('div')
                            timeline.addClass('iptv-program__timeline')
                        
                        let div = document.createElement('div')
                            div.style.width = EPG.timeline(channel, elem.program) + '%'

                        timeline.append(div)

                        this.timeline = ()=>{
                            let percent = EPG.timeline(channel, elem.program)

                            div.style.width = percent + '%'

                            if(percent == 100){
                                let next = EPG.position(channel, program)

                                if(start !== next) this.program(channel, program)
                            }
                        }

                        body.append(timeline)
                    }

                    if(index == 1 && elem.program.desc){
                        let text  = Utils.clear(elem.program.desc)

                        if(text.length > 300) text = text.slice(0,300) + '...'

                        let descr = document.createElement('div')
                            descr.addClass('iptv-program__descr').text(text)

                        body.append(descr)
                    }

                    item.append(time)
                    item.append(body)
                }

                wrap.addClass('iptv-details__list')

                wrap.append(item)
            })

            return wrap
        },{position: start})

        this.progm.empty().append(this.endless.render())
    }

    toggle(){
        Lampa.Controller.add('content',{
            link: this,
            toggle: ()=>{
                if(this.html.find('.selector')){
                    Lampa.Controller.collectionSet(this.html)
                    Lampa.Controller.collectionFocus(false,this.html)
                }
                else this.listener.send('toggle','icons')
            },
            left: ()=>{
                this.listener.send('toggle','icons')
            },
            up: ()=>{
                if(this.endless){
                    this.endless.move(-1)

                    Lampa.Controller.collectionSet(this.html)
                    Lampa.Controller.collectionFocus(false,this.html)
                }
            },
            down: ()=>{
                if(this.endless){
                    this.endless.move(1)

                    Lampa.Controller.collectionSet(this.html)
                    Lampa.Controller.collectionFocus(false,this.html)
                } 
            },
            back: ()=>{
                this.listener.send('back')
            }
        })

        Lampa.Controller.toggle('content')
    }

    render(){
        return this.html
    }

    destroy(){
        this.html.remove()

        clearInterval(this.timer)

        this.wait_for = false
    }
}

export default Details