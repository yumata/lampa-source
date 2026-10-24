import Parser from './parser'

/**
 * Читаемость основных реплик ASS.
 *
 * ASS-файл задаёт оформление сам (у диалогов обычно белый текст с тонким контуром), поэтому настройки субтитров Lampa
 * («Размер», «Окантовка», «Подложка») к нему не применяются и на светлом кадре текст плохо виден.
 * Здесь они переносятся на ОСНОВНЫЕ РЕПЛИКИ: переписываются строки стилей в тексте ASS, так что результат
 * одинаково работает и в простом рендерере, и в libass (JASSUB). Надписи, песни (караоке), реплики с \pos/\move
 * и стили из середины экрана не меняются - они остаются как задумал автор.
 *
 * Основная реплика: стиль, у которого не менее 80% событий не позиционированы, без караоке и с выравниванием
 * в верхней или нижней трети кадра.
 */

const BAND = [1, 2, 3, 7, 8, 9]
const SIZES = {small: 0.8, normal: 1, large: 1.2}

const STROKE_MIN   = 0.0035 // минимальная толщина контура, доля высоты кадра (около 3,8 px при 1080p)
const BACKDROP_PAD = 0.2    // отступ подложки от текста, доля размера шрифта
const BACKDROP_COLOR = '&H73000000' // чёрный, непрозрачность 55% как у подложки Lampa

function round(v){
    return Math.round(v * 100) / 100
}

/**
 * Имена стилей основных реплик
 * @param {object} doc - результат Parser.parse
 * @returns {string[]}
 */
function dialogueStyles(doc){
    let stat = {}

    doc.events.forEach(ev=>{
        let model = Parser.getModel(ev, doc)

        if(!model.hasText) return

        let st = stat[ev.style] || (stat[ev.style] = {total: 0, plain: 0})

        st.total++

        let karaoke = model.segments.some(s=> s.p.kt)
        let band    = BAND.indexOf(model.an) >= 0

        if(!model.pos && !model.move && !karaoke && band) st.plain++
    })

    return Object.keys(stat).filter(name=> stat[name].total > 0 && stat[name].plain / stat[name].total >= 0.8)
}

function fields(line){
    return line.slice(line.indexOf(':') + 1).trim().split(',')
}

/**
 * Применить настройки читаемости к тексту ASS
 * @param {string} text - исходный ASS
 * @param {{stroke:boolean, backdrop:boolean, size:string}} opts - настройки субтитров Lampa
 * @returns {string} - изменённый ASS (или исходный, если менять нечего)
 */
function transform(text, opts){
    opts = opts || {}

    let factor = SIZES[opts.size] || 1

    if(!opts.stroke && !opts.backdrop && factor === 1) return text

    let doc    = Parser.parse(text)
    let names  = dialogueStyles(doc)

    if(!names.length) return text

    let wanted = {}

    names.forEach(n=>{ wanted[n] = true })

    let resY   = doc.info.playResY
    let eol    = text.indexOf('\r\n') >= 0 ? '\r\n' : '\n'
    let lines  = text.replace(/^\uFEFF/, '').split(/\r\n|\n|\r/)
    let inside = false
    let format = null

    for(let i = 0; i < lines.length; i++){
        let line = lines[i].trim()
        let sec  = /^\[(.+)\]$/.exec(line)

        if(sec){
            inside = /^v4\+? styles$|^v4\+\+ styles$/i.test(sec[1].trim())
            format = null

            continue
        }

        if(!inside) continue

        if(/^format:/i.test(line)){
            format = fields(line).map(f=> f.trim().toLowerCase())

            continue
        }

        if(!/^style:/i.test(line) || !format) continue

        let vals = fields(line)
        let at   = (name)=> format.indexOf(name)
        let name = (vals[at('name')] || '').trim()

        if(!wanted[name]) continue

        let size_i    = at('fontsize')
        let outline_i = at('outline')
        let shadow_i  = at('shadow')
        let border_i  = at('borderstyle')
        let ocolor_i  = at('outlinecolour') >= 0 ? at('outlinecolour') : at('tertiarycolour')
        let scaley_i  = at('scaley')

        let size   = size_i >= 0 ? parseFloat(vals[size_i]) : 20
        let scaleY = scaley_i >= 0 ? (parseFloat(vals[scaley_i]) || 100) / 100 : 1
        let outline = outline_i >= 0 ? parseFloat(vals[outline_i]) || 0 : 0

        if(factor !== 1 && size_i >= 0 && !isNaN(size)) vals[size_i] = String(round(size * factor))

        let eff = (isNaN(size) ? 20 : size) * factor * scaleY

        if(opts.backdrop){
            // подложка: BorderStyle 3 рисует непрозрачный прямоугольник цвета OutlineColour
            if(border_i >= 0)  vals[border_i]  = '3'
            if(ocolor_i >= 0)  vals[ocolor_i]  = BACKDROP_COLOR
            if(outline_i >= 0) vals[outline_i] = String(round(Math.max(outline, eff * BACKDROP_PAD)))
            if(shadow_i >= 0)  vals[shadow_i]  = '0'
        }
        else if(opts.stroke && outline_i >= 0){
            vals[outline_i] = String(round(Math.max(outline, resY * STROKE_MIN)))
        }

        let prefix = lines[i].slice(0, lines[i].indexOf(':') + 1)

        lines[i] = prefix + ' ' + vals.join(',')
    }

    return lines.join(eol)
}

export default {
    transform,
    dialogueStyles
}
