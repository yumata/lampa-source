import Api from '../utils/api'
import Icons from './icons'
import Details from './details'
import Menu from './menu'
import EPG from '../utils/epg'
import Utils from '../utils/utils'
import Url from '../utils/url'

class Channels{
    constructor(listener){
        this.listener = listener

        this.html  = Lampa.Template.js('cub_iptv_content')

        this.inner_listener = Lampa.Subscribe()

        this.menu    = new Menu(this.inner_listener)
        this.icons   = new Icons(this.inner_listener)
        this.details = new Details(this.inner_listener)

        this.inner_listener.follow('toggle',name=>{
            this[name].toggle()

            this.active = this[name]
        })

        this.inner_listener.follow('back',()=>{
            this.listener.send('playlist-main')
        })

        this.inner_listener.follow('play',this.play.bind(this))

        this.inner_listener.follow('play-archive',(data)=>{
            this.archive = data

            this.play({
                position: this.icons.icons.indexOf(data.channel),
                total: this.icons.icons.length
            })
        })

        this.active = this.menu

        this.html.find('.iptv-content__menu').append(this.menu.render())
        this.html.find('.iptv-content__channels').append(this.icons.render())
        this.html.find('.iptv-content__details').append(this.details.render())
    }

    build(data){
        this.empty = false

        this.menu.build(data)

        this.listener.send('display',this)
    }

    play(data){
        let cache = {}
            cache.none = []

        let time
        let update

        data.url = Url.prepareUrl(this.icons.icons[data.position].url)

        if(this.archive && this.archive.channel == this.icons.icons[data.position]){
            data.url = Url.catchupUrl(this.archive.channel.url, this.archive.channel.catchup.type, this.archive.channel.catchup.source)
            data.url = Url.prepareUrl(this.archive.channel.url, this.archive.program)
        }

        data.onGetChannel = (position)=>{
            let original  = this.icons.icons[position]
            let channel   = Lampa.Arrays.clone(original)
            let timeshift = this.archive && this.archive.channel == original ? this.archive.timeshift : 0

            channel.name  = Utils.clearChannelName(channel.name)
            channel.group = Utils.clearMenuName(channel.group)
            channel.url   = Url.prepareUrl(channel.url)
            
            if(timeshift){
                channel.shift = timeshift

                channel.url = Url.catchupUrl(original.url, channel.catchup.type, channel.catchup.source)
                channel.url = Url.prepareUrl(channel.url, this.archive.program)
            }

            update = false

            if(channel.id){
                if(!cache[channel.id]){
                    cache[channel.id] = []

                    Api.program({
                        channel_id: channel.id,
                        time: EPG.time(channel,timeshift)
                    }).then(program=>{
                        cache[channel.id] = program
                    }).finally(()=>{
                        Lampa.Player.programReady({
                            channel: channel,
                            position: EPG.position(channel, cache[channel.id], timeshift),
                            total: cache[channel.id].length
                        })
                    })
                }
                else{
                    Lampa.Player.programReady({
                        channel: channel,
                        position: EPG.position(channel, cache[channel.id], timeshift),
                        total: cache[channel.id].length
                    })
                }
            }
            else{
                Lampa.Player.programReady({
                    channel: channel,
                    position: 0,
                    total: 0
                })
            }

            return channel
        }

        data.onGetProgram = (channel, position, container)=>{
            update = false

            let timeshift = channel.shift || 0

            let program = cache[channel.id || 'none']
            let noprog  = document.createElement('div')
                noprog.addClass('player-panel-iptv-item__prog-load')
                noprog.text(Lampa.Lang.translate('iptv_noprogram'))

            container[0].empty().append(noprog)

            if(program.length){
                let start = EPG.position(channel, program, timeshift)
                let list  = program.slice(position, position + 2)
                let now   = program[start]

                if(list.length) container[0].empty()

                list.forEach(prog=>{
                    let item = document.createElement('div')
                        item.addClass('player-panel-iptv-item__prog-item')

                    let span = document.createElement('span')
                        span.html(Lampa.Utils.parseTime(prog.start).time + (now == prog ? ' - ' + Lampa.Utils.parseTime(prog.stop).time : '') + ' &nbsp; ' + Utils.clear(prog.title))

                    item.append(span)

                    if(now == prog){
                        item.addClass('watch')

                        let timeline = document.createElement('div')
                            timeline.addClass('player-panel-iptv-item__prog-timeline')
                        
                        let div = document.createElement('div')
                            div.style.width = EPG.timeline(channel, prog, timeshift) + '%'

                        timeline.append(div)

                        update = ()=>{
                            let percent = EPG.timeline(channel, prog, timeshift)

                            div.style.width = percent + '%'

                            if(percent == 100){
                                let next = EPG.position(channel, program, timeshift)

                                if(start !== next){
                                    Lampa.Player.programReady({
                                        channel: channel,
                                        position: next,
                                        total: cache[channel.id].length
                                    })
                                }
                            }
                        }

                        item.append(timeline)
                    }

                    container[0].append(item)
                })
            }
        }

        Lampa.Player.iptv(data)

        time = setInterval(()=>{
            if(update) update()
        },1000 * 10)

        let destroy = ()=>{
            Lampa.Player.listener.remove('destroy', destroy)

            cache  = null
            update = null

            this.archive = false

            clearInterval(time)
        }

        Lampa.Player.listener.follow('destroy',destroy)
    }

    toggle(){
        if(this.empty){
            Lampa.Controller.add('content',{
                invisible: true,
                toggle: ()=>{
                    Lampa.Controller.clear()
                },
                left: ()=>{
                    Lampa.Controller.toggle('menu')
                },
                up: ()=>{
                    Lampa.Controller.toggle('head')
                },
                back: ()=>{
                    this.listener.send('playlist-main')
                }
            })
    
            Lampa.Controller.toggle('content')
        }
        else this.active.toggle()
    }

    render(){
        return this.empty ? this.empty.render(true) : this.html
    }

    load(playlist){
        this.listener.send('loading')

        Api.playlist(playlist).then(this.build.bind(this)).catch(e=>{
            this.empty = new Lampa.Empty({descr: '<div style="width: 60%; margin:0 auto; line-height: 1.4">'+Lampa.Lang.translate('iptv_noload_playlist')+'</div>'})

            this.listener.send('display',this)
        })
    }

    destroy(){
        this.menu.destroy()
        this.icons.destroy()
        this.details.destroy()

        this.inner_listener.destroy()

        this.active = false

        this.epg_cache = null

        this.html.remove()
    }
}

export default Channels