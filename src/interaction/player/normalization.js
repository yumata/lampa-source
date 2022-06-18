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
    draw_canvas.height = 200

    //размер буффера
    try{
        analyser.fftSize = 2048 * 4
    }
    catch(e){
        try{
            analyser.fftSize = 2048 * 2
        }
        catch(e){
            analyser.fftSize = 2048
        }
    }
    

    //данные от анализа
    analyser.time_array = new Uint8Array(analyser.fftSize)

    //нижний порог
    analyser.min_db = 0

    //уровень для бара
    analyser.draw_db = 0

    //подключаем анализ
    source.connect(analyser)

    //подключаем регулятор звука
    analyser.connect(volume)

    //подключаем к выходу
    volume.connect(context.destination)

    $('body').append(draw_html)
	
    function update(){
        if(!destroy) requestAnimationFrame(update)

        analyser.getByteTimeDomainData(analyser.time_array)

        let total = 0,rms = 0, i = 0
        let float, mdb
        let min = -48

        while ( i < analyser.fftSize ) {
			float = ( analyser.time_array[i++] / 0x80 ) - 1

			total += ( float * float )

			rms = Math.max(rms, float)

            mdb = toDb(float)

			if(!isNaN(mdb)) min = Math.max(min, mdb)
		}

        rms = Math.sqrt(total / analyser.fftSize)

        analyser.min_db = smooth(analyser.min_db, min, 20)

        let db  = toDb(rms)
        let low = (-48) - analyser.min_db

        volume.gain.value = Math.max(0.0,Math.min(2, db / low))

        analyser.draw_db = smooth(analyser.draw_db, volume.gain.value, 5)
        
        if(display){
            draw_context.clearRect(0, 0, draw_canvas.width, draw_canvas.height)

            let down = Math.min(1, Math.max(0, 1 - analyser.draw_db))
            let up   = Math.min(1, Math.max(0, analyser.draw_db - 1))
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
        source.destroy()

        source = null
    }
}

export default Normalization