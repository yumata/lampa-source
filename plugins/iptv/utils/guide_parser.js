import UnpackStream from './unpack'

let cur_time     = 0
let channel      = {}


// Пауза между чанками (снижаем нагрузку на CPU - можно и 0 поставить, но если память не изменяет, то какой-то из браузеров превращал 0 в ~50)
let intervalTime = 10
// Распаковываем по 32 КБ gzip, обычно при сжатии чанк по умолчанию 16 КБ, поэтому меньше нет смысла ставить.
let maxChunkSize = 32 * 1024

let string_data = ''
let percent     = -1
let this_res    = null
let load_end    = false
let chunk_parse = false
let interval    = -1

let dcmpStrm       = function (){}
let content_type   = ''
let cur_pos        = 0
let content_length = 0

let listener = Lampa.Subscribe()

function nextChunk() {
    if (chunk_parse || this_res === null) return

    chunk_parse = true

    let len    = this_res.responseText.length
    let maxPos = Math.min(cur_pos + maxChunkSize, len)

    if (maxPos > cur_pos) {
        let finish = (load_end && maxPos === len)

        dcmpStrm.push(str2ab(this_res.responseText.substring(cur_pos, maxPos)), finish)
        
        cur_pos = maxPos

        percent = content_length ? cur_pos * 100 / content_length : (load_end ? cur_pos * 100 / len : -1)

        listener.send('percent',{
            percent
        })

        if (finish) {
            parseFinish()

            listener.send('end',{
                time: (unixtime() - cur_time),
                channel
            })

            channel = {}
        }
    }
    chunk_parse = false;
}

function parseChannel(attr, string) {
    if (!attr['id']) return; // todo не парсить каналы которых нет в листе
    
    string = string.replace(/\n/g, '')

    let names = []

    let m_name  = string.match(/<display-name[^>]+>(.*?)</g)
    let m_icon  = string.match(/<icon src="(.*?)"/g)

    if(m_name){
        names = m_name.map(n=>{
            return n.slice(0,-1).split('>')[1]
        })
    }

    channel[attr.id] = {
        names: names,
        icon: m_icon ? m_icon[1] : '',
        program: []
    }

    listener.send('channel',{channel: channel[attr.id]})
}

function parseProgramme(attr, string) {
    if (!attr['channel'] || !attr['start'] || !attr['stop'] || !channel[attr.channel]) return

    let start = parseDate(attr.start)
    let stop  = parseDate(attr.stop)

    string = string.replace(/\n/g, '')

    let m_title     = string.match(/<title\s+lang="ru">(.*?)</)
    let m_category  = string.match(/<category\s+lang="ru">(.*?)</)
    let m_desc      = string.match(/<desc\s+lang="ru">(.*?)</)
    let m_icon      = string.match(/<icon src="(.*?)"/g)

    if(!m_title)    m_title    = string.match(/<title>(.*?)</)
    if(!m_category) m_category = string.match(/<category>(.*?)</)
    if(!m_desc)     m_desc     = string.match(/<desc>(.*?)</)

    let title    = m_title ? m_title[1] : ''
    let category = m_category ? m_category[1] : ''
    let desc     = m_desc ? m_desc[1] : ''
    let icon     = m_icon ? m_icon[1] : ''
    let prog     = {
        start: start * 1000,
        stop: stop * 1000,
        title: title,
        category: category,
        desc: desc,
        icon: icon
    }

    channel[attr.channel]['program'].push(prog)

    listener.send('program',{program: prog, channel: channel[attr.channel]})
}

function parseDate(s) {
    return Date.parse(
        s.replace(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})\s+([+-]\d{2})(\d{2})$/, '$1-$2-$3T$4:$5:$6$7:$8')
    ) / 1000;
}

function parseParams(s) {
    let o = {}, m, mm

    if (!!(m = s.match(/([^\s=]+)=((["'])(.*?)\3|\S+)/g))) {
        for (let i = 0; i < m.length; i++) {
            if (!!(mm = m[i].match(/([^\s=]+)=((["'])(.*?)\3|\S+)/))) {
                o[mm[1].toLowerCase()] = mm[4] || mm[2]
            }
        }
    }
    return o
}

function unixtime() {
    return Math.floor((new Date).getTime()/1000)
}

function str2ab(str) {
    let buf = new ArrayBuffer(str.length), bufView = new Uint8Array(buf), i=0

    for (; i<str.length; i++) bufView[i] = str.charCodeAt(i) & 0xff

    return bufView
}

function parseFinish() {
    clearInterval(interval)

    string_data = ''
    percent     = -1
    this_res    = null
    load_end    = false
    chunk_parse = false
    interval    = -1

    dcmpStrm       = function (){}
    content_type   = ''
    cur_pos        = 0
    content_length = 0
}

function parseStart(url) {
    parseFinish()

    channel = {}

    let chOrProgRegExp

    try {
        chOrProgRegExp = new RegExp('\\s*<(programme|channel)(\\s+([^>]+)?)?>(.*?)<\\/\\1\\s*>\\s*', 'gs');
    }
    catch(e) {
        chOrProgRegExp = new RegExp('\\s*<(programme|channel)(\\s+([^>]+)?)?>((.|\\n)*?)<\\/\\1\\s*>\\s*', 'g');
    }

    cur_time = unixtime()

    listener.send('start')

    let xhr = new XMLHttpRequest

    let utfDecode = new UnpackStream.DecodeUTF8(function (data, final) {
        string_data += data

        let lenStart = string_data.length

        string_data = string_data.replace(
            chOrProgRegExp,
            function (match, p1, p2, p3, p4) {
                if (p1 === 'channel') parseChannel(parseParams(p3), p4)
                else parseProgramme(parseParams(p3), p4)

                return '';
            }
        )

        if (lenStart === string_data.length && lenStart > 204800) {
            let text = 'Bad xml.gz file'

            console.log('IPTV',text, string_data.substring(0, 4096) + '...')

            if (!load_end) xhr.abort()
            
            parseFinish()

            listener.send('error',{
                text
            })
        }
    })

    dcmpStrm = new UnpackStream.Decompress(function (chunk, final) {
        utfDecode.push(chunk, final)
    })

    xhr.open('get', url)
    xhr.responseType = 'text'
    xhr.overrideMimeType('text\/plain; charset=x-user-defined')
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 2) {
            // получаем заголовки
            content_type = xhr.getResponseHeader('content-type') || content_type
            content_length = xhr.getResponseHeader('content-length') || content_length

            console.log('IPTV','Content-Type', content_type)
            console.log('IPTV','Content-Length', content_length)

            interval = setInterval(nextChunk, intervalTime)
        }
    }

    xhr.onload = xhr.onprogress = function (e) {
        this_res = this

        load_end = (e.type === 'load')
    }

    xhr.onerror = function () { // происходит, только когда запрос совсем не получилось выполнить
        parseFinish()

        listener.send('error',{
            text: 'Error connect (CORS or bad URL)'
        })
    }

    xhr.onabort = function () {
        parseFinish()

        listener.send('error',{
            text: 'Load abort'
        })
    }

    xhr.ontimeout = function () {
        parseFinish()

        listener.send('error',{
            text: 'Load timeout'
        })
    }

    xhr.send()
}

export default {
    listener,
    start: parseStart
}