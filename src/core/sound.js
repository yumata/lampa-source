import Storage from './storage/storage'
import Platform from './platform'
import Manifest from './manifest'

let sounds = {}

function Sound(option){
    this.option       = option
    this.loaded       = false
    
    this.audio  = new Audio()

    this.audio.src    = option.url
    this.audio.volume = option.volume || 1
    this.audio.load()

    let volume = option.volume || 1
    let isplay = false

    this.audio.addEventListener("playing", event => {
        isplay = true
    })

    this.audio.addEventListener("pause", event => {
        isplay = false
    })

    this.play = function(){
        this.stop()

        let playPromise
    
        try{
            this.audio.currentTime = 0
            this.audio.volume      = volume * (Lampa.Storage.field('interface_sound_level') / 100)

            playPromise = this.audio.play()
        }
        catch(e){ }
    
        if (playPromise !== undefined) {
            playPromise.then(function(){}).catch(function(e){
                console.log('Sound','play promise error:', e.message)
            })
        }
        
        return this
    }

    this.stop = function(){
        if(!isplay) return this

        let stopPromise
    
        try{
            stopPromise = this.audio.pause()
        }
        catch(e){ }
    
        if (stopPromise !== undefined) {
            stopPromise.then(function(){}).catch(function(e){
                console.log('Sound','stop promise error:', e.message)
            })
        }

        return this
    }
    
    return this
}

function init(){
    if(Platform.is('android') || Platform.is('browser') || Platform.is('apple_tv') || Platform.desktop()){
        add('hover',{
            url: Manifest.github_lampa + 'sound/hover.ogg'
        })

        add('enter',{
            url: Manifest.github_lampa + 'sound/hover.ogg',
        })

        add('bell',{
            url: Manifest.github_lampa + 'sound/bell.ogg',
        })
    }
}

function play(name){
    if(sounds[name] && Storage.field('interface_sound_play')) sounds[name].play()
}

function add(name, params){
    try{
        sounds[name] = new Sound(params)

        return sounds[name]
    }
    catch(e){
        return false
    }
}

export default {
    init,
    add,
    play
}