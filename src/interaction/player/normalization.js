import Storage from '../../utils/storage'

let context

function smooth(a,b,s,c){
    return a + ((b - a) * (s*0.02))
}

function toDb(float){
    let db  = 20 * ( Math.log(float) / Math.log(10) )
        db  = Math.max(-48, Math.min(db, 0))

    return db
}

function Source(video){
	let source   = context.createMediaElementSource(video)
    let analyser = context.createAnalyser()
    let volume   = context.createGain()
    let destroy  = false
    let display  = true

    let draw_html    = $('<div class="normalization normalization--visible"><canvas></canvas></div>')
    let draw_canvas  = draw_html.find('canvas')[0]
    let draw_context = draw_canvas.getContext("2d")

    draw_canvas.width  = 5
    draw_canvas.height = Math.round(window.innerHeight * 0.26)

    try{
        analyser.fftSize = 2048 * 4

        console.log('Player','normalization fftSize 2048 * 4')
    }
    catch(e){
        try{
            analyser.fftSize = 2048 * 2

            console.log('Player','normalization fftSize 2048 * 2')
        }
        catch(e){
            analyser.fftSize = 2048

            console.log('Player','normalization fftSize 2048')
        }
    }

    let frequencyData = new Uint8Array(analyser.frequencyBinCount)

    let midFreqRange  = { start: 2000, end: 4000 } // Средние частоты
    let highFreqRange = { start: 4000, end: 8000 } // Высокие частоты

    function calculateRMS(range) {
        let startIndex = Math.floor(range.start * analyser.frequencyBinCount / (context.sampleRate / 2))
        let endIndex   = Math.floor(range.end * analyser.frequencyBinCount / (context.sampleRate / 2))

        startIndex = Math.max(0, Math.min(startIndex, frequencyData.length - 1))
        endIndex   = Math.max(0, Math.min(endIndex, frequencyData.length - 1))
    
        let total = 0
        let count = 0
    
        for (let i = startIndex; i <= endIndex; i++) {
            let value = frequencyData[i]

            total += value * value

            count++
        }
    
        return count > 0 ? Math.sqrt(total / count) : 0
    }

    analyser.gain_smooth = 1

    //подключаем анализ
    source.connect(analyser)

    //подключаем регулятор звука
    analyser.connect(volume)

    //подключаем к выходу
    volume.connect(context.destination)

    $('body').append(draw_html)
	
    function update(){
        if(!destroy) requestAnimationFrame(update)

        analyser.getByteFrequencyData(frequencyData)

        let rms_mid  = calculateRMS(midFreqRange)
        let rms_high = calculateRMS(highFreqRange)

        let db_mid  = toDb(rms_mid / 255)
        let db_high = toDb(rms_high / 255)

        let sm_st = Storage.get('player_normalization_smooth','medium')
        let pw_st = Storage.get('player_normalization_power','hight')

        let pw_am = pw_st == 'hight' ? 1 : pw_st == 'medium' ? 0.7 : 0.35

        let gain = Math.max(0.0, Math.min(2, (db_mid + db_high) / 2 / -24))

        analyser.gain_smooth = sm_st == 'none' ? gain : smooth(analyser.gain_smooth, gain, sm_st == 'hight' ? 45 : sm_st == 'medium' ? 20 : 5)

        volume.gain.value = pw_st == 'none' ? 1 : (1 + (analyser.gain_smooth - 1) * pw_am)
        
        if(display){
            draw_context.clearRect(0, 0, draw_canvas.width, draw_canvas.height)

            let down = Math.min(1, Math.max(0, 1 - volume.gain.value))
            let up   = Math.min(1, Math.max(0, volume.gain.value - 1))
            let half = draw_canvas.height / 2

            draw_context.fillStyle = 'rgba(251,91,91,1)'

            draw_context.fillRect(0, half, draw_canvas.width, half * down)

            draw_context.fillStyle = 'rgba(91,213,251,1)'

            draw_context.fillRect(0, half - (half * up), draw_canvas.width, half * up)
        }
    }

    update()

    this.visible = (status)=>{
        display  = status

        draw_html.toggleClass('normalization--visible',status)
    }

    this.destroy = ()=>{
        volume.disconnect()
        analyser.disconnect()
        source.disconnect()

        destroy = true

        draw_html.remove()
    }
}

function Normalization(params = {}){
    if(!context){
        let classContext = window.AudioContext || window.webkitAudioContext

        context = new classContext()
    } 

    let source

    this.attach = (video)=>{
        if(!source) source = new Source(video)
    }

    this.visible = (status)=>{
        if(source) source.visible(status)
    }

    this.destroy = ()=>{
        if(source) source.destroy()

        source = null
    }
}

export default Normalization