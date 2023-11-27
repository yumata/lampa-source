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

        this.progm_image = false

        this.empty_html = Lampa.Template.js('cub_iptv_details_empty')

        this.listener.follow('details-load',this.draw.bind(this))

        if(window.iptv_mobile) this.html.removeClass('layer--wheight')

        this.timer = setInterval(()=>{
            if(this.timeline) this.timeline()
        },1000 * 5)
    }

    draw(channel){
        this.title.text(Utils.clearChannelName(channel.name))
        
        this.group(channel, Utils.clearMenuName(channel.group || Lampa.Lang.translate('player_unknown')))

        this.wait_for = channel.name

        if(channel.id){
            this.progm.text(Lampa.Lang.translate('loading')+'...')

            Api.program({
                name: channel.name,
                channel_id: channel.id,
                time: EPG.time(channel),
                tvg: channel.tvg
            }).then((program)=>{
                if(this.wait_for == channel.name){
                    if(program.length) this.program(channel, program)
                    else this.empty()
                }
            }).catch((e)=>{
                this.empty()
            })
        }
        else{
            this.empty()
        }
    }

    group(channel, title){
        this.play.empty()

        let group = document.createElement('span')
            group.text(title)

        if(Utils.hasArchive(channel)){
            let archive = document.createElement('span')
                archive.addClass('lb').text('A')

            this.play.append(archive)
        }

        let hd = Utils.isHD(channel.name)

        if(hd){
            let hd_lb = document.createElement('span')
                hd_lb.addClass('lb').text(hd.toUpperCase())

            this.play.append(hd_lb)
        }

        this.play.append(group)
    }

    empty(){
        this.timeline = false

        this.progm.empty().append(this.empty_html)
    }

    buildProgramList(channel, program, params){
        let stime   = EPG.time(channel)
        let start   = EPG.position(channel, program)
        let archive = Utils.hasArchive(channel)

        if(!params && program[start]){
            this.group(channel, Lampa.Utils.shortText(Utils.clear(program[start].title),50))
        }

        return new Lampa.Endless((position)=>{
            if(position >= program.length) return this.endless.to(position-1)

            let wrap = document.createElement('div')
            let list = EPG.list(channel, program, 10, position)

            wrap.addClass('iptv-details__list')

            list.forEach((elem, index)=>{
                let item = document.createElement('div')

                if(elem.type == 'date') item.addClass('iptv-program-date').text(elem.date)
                else{
                    item.addClass('iptv-program selector')

                    let head, icon_wrap, icon_img, head_body

                    let time = document.createElement('div')
                        time.addClass('iptv-program__time').text(Lampa.Utils.parseTime(elem.program.start).time)

                    let body = document.createElement('div')
                        body.addClass('iptv-program__body')

                    let title = document.createElement('div')
                        title.addClass('iptv-program__title').text(Utils.clear(elem.program.title))

                    if(elem.program.icon && index == 1){
                        head      = document.createElement('div')
                        head_body = document.createElement('div')
                        icon_wrap = document.createElement('div')
                        icon_img  = document.createElement('img')

                        head.addClass('iptv-program__head')
                        head_body.addClass('iptv-program__head-body')
                        icon_wrap.addClass('iptv-program__icon-wrap')
                        icon_img.addClass('iptv-program__icon-img')

                        icon_wrap.append(icon_img)

                        head.append(icon_wrap)
                        head.append(head_body)

                        head_body.append(title)

                        body.append(head)

                        if(this.progm_image && this.progm_image.waiting) this.progm_image.src = ''

                        icon_img.onload = ()=>{
                            icon_img.waiting = false

                            icon_wrap.addClass('loaded')
                        }

                        icon_img.error = ()=>{
                            icon_wrap.addClass('loaded-error')

                            icon_img.src = './img/img_broken.svg'
                        }

                        icon_img.waiting = true
                        icon_img.src     = elem.program.icon

                        this.progm_image = icon_img
                    }
                    else{
                        body.append(title)
                    }
                        
                    
                    if(elem.watch){
                        let timeline = document.createElement('div')
                            timeline.addClass('iptv-program__timeline')
                        
                        let div = document.createElement('div')
                            div.style.width = EPG.timeline(channel, elem.program) + '%'

                        timeline.append(div)

                        if(!params){
                            this.timeline = ()=>{
                                let percent = EPG.timeline(channel, elem.program)

                                div.style.width = percent + '%'

                                if(percent == 100){
                                    let next = EPG.position(channel, program)

                                    if(start !== next) this.program(channel, program)
                                }
                            }
                        }

                        if(archive){
                            item.on('hover:enter',()=>{
                                let data = {
                                    program: elem.program,
                                    position: position,
                                    channel: channel,
                                    playlist: program.slice(Math.max(0,position - 40), start)
                                }

                                if(params) params.onPlay(data)
                                else this.listener.send('play-archive',data)
                            })
                        }

                        item.addClass('played')

                        if(elem.program.icon){
                            head_body.append(timeline)
                        }
                        else{
                            body.append(timeline)
                        }
                    }

                    if(index == 1 && elem.program.desc){
                        let text  = Utils.clear(elem.program.desc)

                        if(text.length > 300) text = text.slice(0,300) + '...'

                        let descr = document.createElement('div')
                            descr.addClass('iptv-program__descr').text(text)

                        body.append(descr)
                    }

                    if(archive){
                        let minus = stime - archive * 1000 * 60 * 60 * 24

                        if(elem.program.start > minus && elem.program.stop < stime){
                            item.addClass('archive')

                            item.on('hover:enter',()=>{
                                let data = {
                                    program: elem.program,
                                    position: position,
                                    channel: channel,
                                    timeshift: stime - elem.program.start,
                                    playlist: program.slice(Math.max(0,position - 40), start)
                                }

                                if(params) params.onPlay(data)
                                else this.listener.send('play-archive', data)
                            })
                        }
                    }

                    item.append(time)
                    item.append(body)
                }

                wrap.append(item)
            })

            return wrap
        },{position: start})
    }

    /**
     * Программа в плеере
     */

    playlist(channel, program, params = {}){
        return this.buildProgramList(channel, program, params)
    }

    /**
     * Программа в главном интерфейсе
     */
    program(channel, program){
        if(this.endless) this.endless.destroy()

        this.timeline = false

        this.endless = this.buildProgramList(channel, program)

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