import Subscribe from '../../utils/subscribe'
import Reguest from '../../utils/reguest'



function time(val){
    let regex = /(\d+):(\d{2}):(\d{2})/
    let parts = regex.exec(val)

    if (parts === null)  return 0

    for (let i = 1; i < 5; i++) {
        parts[i] = parseInt(parts[i], 10)

        if (isNaN(parts[i])) parts[i] = 0
    }

    //hours + minutes + seconds + ms
    return parts[1] * 3600000 + parts[2] * 60000 + parts[3] * 1000;
}

function parseSRT(data,ms){
    var useMs = ms ? true : false

    data = data.replace(/\r/g, '')

    var regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g

    data = data.split(regex)

    data.shift();

    let items = []

    for (let i = 0; i < data.length; i += 4) {
        items.push({
            id: data[i].trim(),
            startTime: useMs ? time(data[i + 1].trim()) : data[i + 1].trim(),
            endTime: useMs ? time(data[i + 2].trim()) : data[i + 2].trim(),
            text: data[i + 3].trim()
        });
    }

    return items
}

function parse(data,ms){
    if(/WEBVTT/gi.test(data))  return parseVTT(data,ms)
    else                       return parseSRT(data,ms)
}

function parseVTT(data,ms){
    let useMs = ms ? true : false

    data = data.replace(/WEBVTT/gi, '').trim()
    data = data.replace(/\r/g, '')
    data = data.replace(/(\d+):(\d+)\.(\d+) --> (\d+):(\d+)\.(\d+)/g, '00:$1:$2.$3 --> 00:$4:$5.$6')

    let regex = /(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/g

    data = data.split(regex)

    data.shift()

    let items = []

    for (let i = 0; i < data.length; i += 3) {
        items.push({
            id: data[i].trim(),
            startTime: useMs ? time(data[i + 0].trim()) : data[i + 0].trim(),
            endTime: useMs ? time(data[i + 1].trim()) : data[i + 1].trim(),
            text: data[i + 2].trim()
        });
    }

    return items
}

function create(){
    let parsed
    let network  = new Reguest()

    this.listener = Subscribe()
	
	this.load = function(url){
        network.silent(url,(data)=>{
            if(data){
                parsed = parse(data,true)
            }
        },false,false,{
            dataType: 'text'
        })
    }

	this.update = function(time_sec){
		let time_ms = time_sec * 1000

		if(parsed){
			let text = ''

			for (let i = 0; i < parsed.length; i++) {
				let sub = parsed[i]

				if(time_ms > sub.startTime &&  time_ms < sub.endTime){
					text = sub.text.replace("\n",'<br>')

					break
				}
			}

            this.listener.send('subtitle',{text:text.trim()})
		}
	}

    this.destroy = function(){
        network.clear()

        network = null

        this.listener = null
    }
}

export default create