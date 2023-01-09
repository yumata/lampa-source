let context = false
let buffers = {}
let loading = {}

try{
    context = new (window.AudioContext || window.webkitAudioContext)
}
catch(e){}


function Sound(option){
    this.option       = option
    this.isPlay       = false
    this.loaded       = false
    
    this.audio  = context.createBufferSource()
    this.buffer = context.createBuffer(2, context.sampleRate * 0.1, context.sampleRate)
    this.cache  = buffers[option.url]
    this.gain   = context.createGain()
    
	if(!this.cache){
        loadFile(option.url,(buffer)=>{
            this.buffer = buffer
            this.loaded = true
        })
    }
    else{
        this.buffer = this.cache
    } 
    
    this.onended = function(){
        this.isPlay = false
    }

    this.play = function(){
        this.stop()

        this.isPlay = true
        
        this.audio                    = context.createBufferSource()
        this.audio.buffer             = this.buffer
        this.audio.onended            = this.onended.bind(this)
        
        this.audio.connect(this.gain)
        this.gain.connect(context.destination)

        this.gain.gain.value = 0.4
        
        this.audio.start(0)
        
        return this
    }

    this.stop = function(){
        if(this.isPlay){
            this.isPlay = false
            
            this.audio.onended = false
            
            this.audio.stop(0)
        }

        return this
    }
    
    return this
}

function loadFile(url,call){
    if(buffers[url]){
        call(buffers[url])
        
        return
    } 
    
    if(loading[url]){
        loading[url].push(call)
        
        return
    }
    else{
        loading[url] = [call]
    }
    
    let xhr = new XMLHttpRequest()
        xhr.open('GET', url, true)
        xhr.responseType = 'arraybuffer'
        xhr.onload = function(e) {
            context.decodeAudioData(this.response,function(decodedArrayBuffer){
                buffers[url] = decodedArrayBuffer
                
                for(let i = 0; i < loading[url].length; i++){
                    loading[url][i](decodedArrayBuffer)
                }
                
                delete loading[url]
                
            }, function(e) {
                console.log('Sound','Error decoding file', e)
            })
        }
        xhr.send()
}

let sounds = {}

function play(name){
    if(sounds[name]) sounds[name].play()
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