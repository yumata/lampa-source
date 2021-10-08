import Video from './player/video'
import Panel from './player/panel'
import Info from './player/info'
import Controller from './controller'
import Template from './template'
import Utils from '../utils/math'
import Playlist from './player/playlist'
import Storage from '../utils/storage'


let html = Template.get('player')
    html.append(Video.render())
    html.append(Panel.render())
    html.append(Info.render())

let callback
let object = {}


Video.listener.follow('timeupdate',(e)=>{
    Panel.update('time',Utils.secondsToTime(e.current | 0,true))
    Panel.update('timenow',Utils.secondsToTime(e.current || 0))
    Panel.update('timeend',Utils.secondsToTime(e.duration || 0))
    Panel.update('position', (e.current / e.duration * 100) + '%')
})

Video.listener.follow('progress',(e)=>{
    Panel.update('peding',e.down)
})

Video.listener.follow('canplay',(e)=>{
    Panel.canplay()
})

Video.listener.follow('play',(e)=>{
    Panel.update('play')
})

Video.listener.follow('pause',(e)=>{
    Panel.update('pause')
})

Video.listener.follow('rewind', (e)=>{
    Panel.rewind()
})

Video.listener.follow('ended', (e)=>{
    Playlist.next()
})

Panel.listener.follow('playpause',(e)=>{
    Video.playpause()
})

Panel.listener.follow('playlist',(e)=>{
    Playlist.show()
})

Panel.listener.follow('size',(e)=>{
    Video.size(e.size)

    Storage.set('player_size',e.size)
})

Panel.listener.follow('prev',(e)=>{
    Playlist.prev()
})

Panel.listener.follow('next',(e)=>{
    Playlist.next()
})

Panel.listener.follow('rprev',(e)=>{
    Video.rewind(false)
})

Panel.listener.follow('rnext',(e)=>{
    Video.rewind(true)
})

Playlist.listener.follow('select',(e)=>{
    destroy()

    play(e.item)
})

function toggle(){
    Controller.add('player',{
        invisible: true,
        toggle: ()=>{
            Panel.hide()
        },
        up: ()=>{
            Panel.toggle()
        },
        down: ()=>{
            Panel.toggle()
        },
        right: ()=>{
            Video.rewind(true)
        },
        left: ()=>{
            Video.rewind(false)
        },
        gone: ()=>{

        },
        enter: ()=>{
            Video.playpause()
        },
        back: ()=>{
            destroy()

            if(callback) callback()
            else Controller.toggle('content')

            callback = false
        }
    })

    Controller.toggle('player')
}

function destroy(){
    Video.destroy()

    Panel.destroy()

    Info.destroy()

    html.detach()
}

function play(data){
    Playlist.url(data.url)

    Video.url(data.url)

    Video.size(Storage.get('player_size','default'))

    Info.set(data)
    
    $('body').append(html)

    toggle()

    Panel.show(true)
}

function playlist(playlist){
    Playlist.set(playlist)
}

function onBack(back){
    callback = back
}

function render(){
    return html
}

export default {
    play,
    playlist,
    render,
    callback: onBack
}