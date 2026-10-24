/**
 * Парсер ASS/SSA: [Script Info], [V4+ Styles]/[V4 Styles], [Events] и override-теги в тексте событий.
 * Не зависит от DOM, поэтому его можно использовать и в рендерере, и в тестах.
 */

// legacy-выравнивание SSA (\a и Alignment в v4.00) -> numpad (\an)
const LEGACY_AN = {1: 1, 2: 2, 3: 3, 5: 7, 6: 8, 7: 9, 9: 4, 10: 5, 11: 6}

// порядок важен: длинные имена раньше коротких, clip раньше c
const TAG_RE = /^\\(fscx|fscy|fsp|fs|fn|fade|fad|move|pos|org|iclip|clip|1a|2a|3a|4a|1c|2c|3c|4c|c|alpha|an|a|xbord|ybord|bord|xshad|yshad|shad|blur|be|fax|fay|frx|fry|frz|fr|kf|ko|kt|k|K|b|i|u|s|q|r|t|p)/

// теги, аргумент которых записывается в скобках
const PAREN_TAGS = {fade: 1, fad: 1, move: 1, pos: 1, org: 1, iclip: 1, clip: 1, t: 1}

function num(v, def){
    let n = parseFloat(v)

    return isNaN(n) ? def : n
}

/**
 * Цвет из поля стиля: &HAABBGGRR (hex) или десятичное число
 * @returns {{r:number,g:number,b:number,a:number}|null} a - непрозрачность 0..1
 */
function parseColor(v){
    let s = String(v === undefined || v === null ? '' : v).trim()
    let n

    if(!s) return null

    if(/^&?h/i.test(s)) n = parseInt(s.replace(/^&?h/i, '').replace(/&+$/, ''), 16)
    else                n = parseInt(s, 10)

    if(isNaN(n)) return null

    n = n >>> 0

    return {r: n & 255, g: (n >>> 8) & 255, b: (n >>> 16) & 255, a: 1 - ((n >>> 24) & 255) / 255}
}

/**
 * Цвет из override-тега: &HBBGGRR& (без альфы)
 */
function parseColorTag(v){
    let s = String(v || '').trim().replace(/^&?h/i, '').replace(/&+$/, '')

    if(!s) return null

    let n = parseInt(s, 16)

    if(isNaN(n)) return null

    return {r: n & 255, g: (n >>> 8) & 255, b: (n >>> 16) & 255}
}

/**
 * Альфа из override-тега: &HAA& -> непрозрачность 0..1
 */
function parseAlphaTag(v){
    let s = String(v || '').trim().replace(/^&?h/i, '').replace(/&+$/, '')
    let n = parseInt(s, 16)

    return isNaN(n) ? null : 1 - (n & 255) / 255
}

/**
 * Время h:mm:ss.cc -> секунды
 */
function parseTime(v){
    let m = /^\s*(\d+):(\d{1,2}):(\d{1,2})(?:[.,](\d+))?/.exec(v || '')

    if(!m) return 0

    let frac = m[4] ? parseFloat('0.' + m[4]) : 0

    return parseInt(m[1], 10) * 3600 + parseInt(m[2], 10) * 60 + parseInt(m[3], 10) + frac
}

function splitFormat(line){
    return line.slice(line.indexOf(':') + 1).split(',').map(a=>a.trim().toLowerCase())
}

/**
 * Разбить строку по первым n-1 запятым (последнее поле - текст, в нём могут быть запятые)
 */
function splitLimited(str, n){
    let out = []
    let pos = 0

    for(let i = 0; i < n - 1; i++){
        let k = str.indexOf(',', pos)

        if(k < 0) break

        out.push(str.slice(pos, k))

        pos = k + 1
    }

    out.push(str.slice(pos))

    return out
}

function makeStyle(fields, info){
    let legacy = info.legacy

    let an = parseInt(fields.alignment, 10)

    if(isNaN(an)) an = 2
    else if(legacy) an = LEGACY_AN[an] || 2

    return {
        name: fields.name || 'Default',
        font: fields.fontname || 'Arial',
        size: num(fields.fontsize, 20),
        c1: parseColor(fields.primarycolour) || {r: 255, g: 255, b: 255, a: 1},
        c2: parseColor(fields.secondarycolour) || {r: 255, g: 0, b: 0, a: 1},
        c3: parseColor(fields.outlinecolour || fields.tertiarycolour) || {r: 0, g: 0, b: 0, a: 1},
        c4: parseColor(fields.backcolour) || {r: 0, g: 0, b: 0, a: 1},
        bold: num(fields.bold, 0) !== 0,
        italic: num(fields.italic, 0) !== 0,
        underline: num(fields.underline, 0) !== 0,
        strike: num(fields.strikeout, 0) !== 0,
        scaleX: num(fields.scalex, 100) / 100,
        scaleY: num(fields.scaley, 100) / 100,
        spacing: num(fields.spacing, 0),
        angle: num(fields.angle, 0),
        borderStyle: num(fields.borderstyle, 1),
        outline: num(fields.outline, 2),
        shadow: num(fields.shadow, 0),
        an: an,
        marginL: num(fields.marginl, 10),
        marginR: num(fields.marginr, 10),
        marginV: num(fields.marginv, 10)
    }
}

const DEFAULT_STYLE_FIELDS = {
    name: 'Default', fontname: 'Arial', fontsize: '20',
    primarycolour: '&H00FFFFFF', secondarycolour: '&H000000FF', outlinecolour: '&H00000000', backcolour: '&H00000000',
    bold: '0', italic: '0', underline: '0', strikeout: '0', scalex: '100', scaley: '100', spacing: '0', angle: '0',
    borderstyle: '1', outline: '2', shadow: '0', alignment: '2', marginl: '10', marginr: '10', marginv: '10'
}

/**
 * Разобрать ASS/SSA файл
 * @param {string} text
 * @returns {{info:object, styles:object, events:Array, maxDuration:number}}
 */
function parse(text){
    text = String(text || '').replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n')

    let info = {playResX: 0, playResY: 0, wrapStyle: 0, scaledBorder: false, scriptType: '', legacy: false}
    let styles = {}
    let events = []

    let section      = ''
    let style_format = null
    let event_format = null
    let order        = 0

    let lines = text.split('\n')

    for(let li = 0; li < lines.length; li++){
        let line = lines[li].trim()

        if(!line || line[0] === ';') continue

        let sec = /^\[(.+)\]$/.exec(line)

        if(sec){
            section = sec[1].toLowerCase()

            continue
        }

        if(section === 'script info'){
            let k = line.indexOf(':')

            if(k < 0) continue

            let key = line.slice(0, k).trim().toLowerCase()
            let val = line.slice(k + 1).trim()

            if(key === 'playresx')                   info.playResX = num(val, 0)
            else if(key === 'playresy')              info.playResY = num(val, 0)
            else if(key === 'wrapstyle')             info.wrapStyle = num(val, 0)
            else if(key === 'scaledborderandshadow') info.scaledBorder = /^yes$/i.test(val)
            else if(key === 'scripttype'){
                info.scriptType = val.toLowerCase()
                info.legacy     = info.scriptType.indexOf('4.00') >= 0 && info.scriptType.indexOf('+') < 0
            }
        }
        else if(section === 'v4+ styles' || section === 'v4 styles' || section === 'v4++ styles'){
            if(/^format:/i.test(line)){
                style_format = splitFormat(line)
            }
            else if(/^style:/i.test(line) && style_format){
                let raw    = line.slice(line.indexOf(':') + 1).trim().split(',')
                let fields = Object.assign({}, DEFAULT_STYLE_FIELDS)

                style_format.forEach((name, i)=>{
                    if(raw[i] !== undefined) fields[name] = raw[i].trim()
                })

                let st = makeStyle(fields, info)

                styles[st.name] = st
            }
        }
        else if(section === 'events'){
            if(/^format:/i.test(line)){
                event_format = splitFormat(line)
            }
            else if(/^dialogue:/i.test(line)){
                let fmt = event_format || ['layer', 'start', 'end', 'style', 'name', 'marginl', 'marginr', 'marginv', 'effect', 'text']
                let raw = splitLimited(line.slice(line.indexOf(':') + 1).replace(/^\s+/, ''), fmt.length)
                let f   = {}

                fmt.forEach((name, i)=>{ f[name] = raw[i] !== undefined ? raw[i] : '' })

                let ev = {
                    order: order++,
                    layer: num(f.layer !== undefined ? f.layer : f.marked, 0),
                    start: parseTime(f.start),
                    end: parseTime(f.end),
                    style: (f.style || 'Default').trim().replace(/^\*/, ''),
                    marginL: num(f.marginl, 0),
                    marginR: num(f.marginr, 0),
                    marginV: num(f.marginv, 0),
                    effect: (f.effect || '').trim(),
                    text: f.text || '',
                    model: null
                }

                if(ev.end > ev.start) events.push(ev)
            }
        }
    }

    if(!Object.keys(styles).length) styles.Default = makeStyle(DEFAULT_STYLE_FIELDS, info)

    // как в libass: без PlayRes берём 384x288, если задано только одно значение - сохраняем пропорцию
    if(!info.playResX && !info.playResY){
        info.playResX = 384
        info.playResY = 288
    }
    else if(!info.playResX) info.playResX = info.playResY * 4 / 3
    else if(!info.playResY) info.playResY = info.playResX * 3 / 4

    events.sort((a, b)=> a.start - b.start || a.order - b.order)

    let maxDuration = 0

    events.forEach(e=>{ maxDuration = Math.max(maxDuration, e.end - e.start) })

    return {info, styles, events, maxDuration}
}

/**
 * Разобрать override-теги одного блока {...}: [[имя, аргумент], ...]
 */
function scanTags(block){
    let out = []
    let i   = 0
    let n   = block.length

    while(i < n){
        if(block[i] !== '\\'){
            i++

            continue
        }

        let m = TAG_RE.exec(block.slice(i))

        if(!m){
            i++

            continue
        }

        let name = m[1]
        let j    = i + m[0].length
        let arg  = ''

        if(PAREN_TAGS[name] && block[j] === '('){
            let depth = 0
            let k     = j

            for(; k < n; k++){
                if(block[k] === '(') depth++
                else if(block[k] === ')'){
                    depth--

                    if(!depth) break
                }
            }

            arg = block.slice(j + 1, k)
            i   = k + 1
        }
        else{
            let k = block.indexOf('\\', j)

            if(k < 0) k = n

            arg = block.slice(j, k)
            i   = k
        }

        out.push([name, arg.trim()])
    }

    return out
}

function baseProps(style){
    return {
        font: style.font, size: style.size,
        c1: style.c1, c2: style.c2, c3: style.c3, c4: style.c4,
        bold: style.bold, italic: style.italic, underline: style.underline, strike: style.strike,
        scaleX: style.scaleX, scaleY: style.scaleY, spacing: style.spacing,
        outline: style.outline, shadow: style.shadow,
        draw: false, kt: '', ks: 0, kd: 0
    }
}

function withColor(p, key, rgb){
    let old = p[key]

    return {r: rgb.r, g: rgb.g, b: rgb.b, a: old.a}
}

/**
 * Построить модель события: сегменты текста со своими свойствами и параметры уровня события
 * @returns {{segments:Array, an:number, pos:Array|null, move:Array|null, fad:Array|null, wrap:number}}
 */
function buildModel(ev, doc){
    let style = doc.styles[ev.style] || doc.styles.Default || doc.styles[Object.keys(doc.styles)[0]]
    let model = {segments: [], an: style.an, pos: null, move: null, fad: null, wrap: doc.info.wrapStyle, style: style}
    let props = baseProps(style)
    let kcur  = 0

    let text = ev.text
    let re   = /\{([^}]*)\}/g
    let last = 0
    let m

    let push = (str)=>{
        if(!str) return

        str = str.replace(/\\N/g, '\n').replace(/\\n/g, ' ').replace(/\\h/g, '\u00a0')

        if(props.draw || !str) return

        model.segments.push({text: str, p: props})
    }

    let apply = (name, arg)=>{
        switch(name){
            case 'b': {
                let v = parseInt(arg, 10)

                props = Object.assign({}, props, {bold: arg === '' ? style.bold : (v === 1 || v >= 600)})

                break
            }
            case 'i':  props = Object.assign({}, props, {italic: arg === '' ? style.italic : arg === '1'}); break
            case 'u':  props = Object.assign({}, props, {underline: arg === '' ? style.underline : arg === '1'}); break
            case 's':  props = Object.assign({}, props, {strike: arg === '' ? style.strike : arg === '1'}); break
            case 'fn': props = Object.assign({}, props, {font: arg || style.font}); break
            case 'fs': props = Object.assign({}, props, {size: arg ? Math.abs(num(arg, style.size)) || style.size : style.size}); break
            case 'fscx': props = Object.assign({}, props, {scaleX: arg ? num(arg, 100) / 100 : style.scaleX}); break
            case 'fscy': props = Object.assign({}, props, {scaleY: arg ? num(arg, 100) / 100 : style.scaleY}); break
            case 'fsp':  props = Object.assign({}, props, {spacing: arg ? num(arg, 0) : style.spacing}); break
            case 'bord': props = Object.assign({}, props, {outline: arg ? Math.max(0, num(arg, 0)) : style.outline}); break
            case 'shad': props = Object.assign({}, props, {shadow: arg ? Math.max(0, num(arg, 0)) : style.shadow}); break
            case 'c':
            case '1c': {
                let c = parseColorTag(arg)

                props = Object.assign({}, props, {c1: c ? withColor(props, 'c1', c) : style.c1})

                break
            }
            case '2c': {
                let c = parseColorTag(arg)

                props = Object.assign({}, props, {c2: c ? withColor(props, 'c2', c) : style.c2})

                break
            }
            case '3c': {
                let c = parseColorTag(arg)

                props = Object.assign({}, props, {c3: c ? withColor(props, 'c3', c) : style.c3})

                break
            }
            case '4c': {
                let c = parseColorTag(arg)

                props = Object.assign({}, props, {c4: c ? withColor(props, 'c4', c) : style.c4})

                break
            }
            case 'alpha': {
                let a = parseAlphaTag(arg)

                if(a !== null){
                    props = Object.assign({}, props, {
                        c1: Object.assign({}, props.c1, {a}), c2: Object.assign({}, props.c2, {a}),
                        c3: Object.assign({}, props.c3, {a}), c4: Object.assign({}, props.c4, {a})
                    })
                }

                break
            }
            case '1a':
            case '2a':
            case '3a':
            case '4a': {
                let a   = parseAlphaTag(arg)
                let key = 'c' + name[0]

                if(a !== null){
                    let patch = {}

                    patch[key] = Object.assign({}, props[key], {a})

                    props = Object.assign({}, props, patch)
                }

                break
            }
            case 'r': {
                let st = arg && doc.styles[arg] ? doc.styles[arg] : style

                props = baseProps(st)

                break
            }
            case 'p': {
                let v = parseInt(arg, 10)

                props = Object.assign({}, props, {draw: v > 0})

                break
            }
            case 'k':
            case 'K':
            case 'kf':
            case 'ko': {
                let d = num(arg, 0)

                props = Object.assign({}, props, {kt: name === 'K' ? 'kf' : name, ks: kcur, kd: d})

                kcur += d

                break
            }
            case 'q': model.wrap = num(arg, model.wrap); break
            case 'an': {
                let v = parseInt(arg, 10)

                if(v >= 1 && v <= 9 && !model.anSet){
                    model.an    = v
                    model.anSet = true
                }

                break
            }
            case 'a': {
                let v = LEGACY_AN[parseInt(arg, 10)]

                if(v && !model.anSet){
                    model.an    = v
                    model.anSet = true
                }

                break
            }
            case 'pos': {
                let a = arg.split(',').map(parseFloat)

                if(a.length >= 2 && !isNaN(a[0]) && !isNaN(a[1]) && !model.pos && !model.move) model.pos = [a[0], a[1]]

                break
            }
            case 'move': {
                let a = arg.split(',').map(parseFloat)

                if(a.length >= 4 && !model.pos && !model.move){
                    model.move = {x1: a[0], y1: a[1], x2: a[2], y2: a[3], t1: a.length >= 6 ? a[4] : 0, t2: a.length >= 6 ? a[5] : 0}
                }

                break
            }
            case 'fad': {
                let a = arg.split(',').map(parseFloat)

                if(a.length >= 2 && !isNaN(a[0]) && !isNaN(a[1])) model.fad = [a[0], a[1]]

                break
            }
            default: break // t, clip, iclip, org, fade, blur, be, fax, fay, frx, fry, frz, fr - пока не поддерживаются
        }
    }

    while((m = re.exec(text)) !== null){
        push(text.slice(last, m.index))

        scanTags(m[1]).forEach(t=> apply(t[0], t[1]))

        last = m.index + m[0].length
    }

    push(text.slice(last))

    // позиции для \move заданы в тех же координатах, что и \pos
    model.hasText = model.segments.some(s=> s.text.replace(/\s+/g, '') !== '')

    return model
}

/**
 * Модель события (кэшируется в самом событии)
 */
function getModel(ev, doc){
    if(!ev.model) ev.model = buildModel(ev, doc)

    return ev.model
}

export default {
    parse,
    getModel,
    buildModel,
    parseColor,
    parseTime,
    scanTags
}
