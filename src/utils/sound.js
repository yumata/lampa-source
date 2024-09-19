import Storage from './storage'

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
    add,
    play
}