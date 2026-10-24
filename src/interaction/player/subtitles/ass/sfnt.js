/**
 * Чтение имён шрифтов (таблица name) из TTF/OTF/TTC без загрузки файла целиком.
 *
 * read(start, end) - функция, возвращающая Promise<Uint8Array> с байтами файла [start, end).
 * Обычно это Range-запрос, поэтому из большого файла (например, TTC на 12 МБ) читаются только
 * заголовок и сама таблица имён.
 */

const TAG_TTC  = 0x74746366 // 'ttcf'
const TAG_OTTO = 0x4f54544f // 'OTTO'
const TAG_TRUE = 0x74727565 // 'true'
const TAG_TTF  = 0x00010000

const HEAD_SIZE = 4096
const MAX_NAME_TABLE = 262144

function u16(b, o){
    return (b[o] << 8) | b[o + 1]
}

function u32(b, o){
    return ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0
}

function tag4(b, o){
    return String.fromCharCode(b[o], b[o + 1], b[o + 2], b[o + 3])
}

function decode(b, start, len, platform){
    let s = ''

    if(start + len > b.length) len = Math.max(0, b.length - start)

    if(platform === 1){
        // Macintosh: для латиницы достаточно ASCII
        for(let i = 0; i < len; i++) s += String.fromCharCode(b[start + i])
    }
    else{
        // Windows/Unicode: UTF-16BE
        for(let i = 0; i + 1 < len; i += 2) s += String.fromCharCode((b[start + i] << 8) | b[start + i + 1])
    }

    return s.replace(/\u0000/g, '').trim()
}

/**
 * Вес шрифта по названию начертания
 * @param {string} sub - например, 'Bold Italic', 'Semibold', 'Regular'
 */
function weightOf(sub){
    let s = String(sub || '').toLowerCase().replace(/[\s_-]+/g, '')

    if(/black|heavy/.test(s))               return 900
    if(/extrabold|ultrabold/.test(s))       return 800
    if(/semibold|demibold|demi/.test(s))    return 600
    if(/bold/.test(s))                      return 700
    if(/medium/.test(s))                    return 500
    if(/extralight|ultralight/.test(s))     return 200
    if(/light/.test(s))                     return 300
    if(/thin|hairline/.test(s))             return 100

    return 400
}

function parseNameTable(b){
    if(b.length < 6) return null

    let count  = u16(b, 2)
    let strOff = u16(b, 4)
    let names  = {}

    for(let i = 0; i < count; i++){
        let p = 6 + i * 12

        if(p + 12 > b.length) break

        let platform = u16(b, p)
        let lang     = u16(b, p + 4)
        let id       = u16(b, p + 6)
        let len      = u16(b, p + 8)
        let off      = u16(b, p + 10)

        if(id !== 1 && id !== 2 && id !== 4 && id !== 6 && id !== 16 && id !== 17) continue

        let s = decode(b, strOff + off, len, platform)

        if(!s) continue

        let list = names[id] || (names[id] = [])

        if(list.indexOf(s) >= 0) continue

        // английские названия - вперёд
        if((platform === 3 && lang === 0x409) || (platform === 1 && lang === 0)) list.unshift(s)
        else list.push(s)
    }

    let first = (id)=> names[id] && names[id][0] || ''

    let family = first(16) || first(1)
    let sub    = first(17) || first(2)
    let all    = []

    ;[1, 4, 6, 16].forEach(id=>{
        (names[id] || []).forEach(n=>{
            if(all.indexOf(n) < 0) all.push(n)
        })
    })

    return {
        family,
        subfamily: sub,
        full: first(4),
        ps: first(6),
        names: all,
        weight: weightOf(sub),
        italic: /italic|oblique/i.test(sub)
    }
}

/**
 * Прочитать имена всех начертаний в файле шрифта
 * @param {function(number, number): Promise<Uint8Array>} read
 * @param {number} size - размер файла
 * @returns {Promise<Array<{index:number, family:string, subfamily:string, full:string, ps:string, names:string[], weight:number, italic:boolean}>>}
 */
async function readNames(read, size){
    let head = await read(0, Math.min(size, HEAD_SIZE))
    let cache = {}

    let get = async(start, end)=>{
        end = Math.min(end, size)

        if(start >= 0 && end <= head.length) return head.subarray(start, end)

        let key = start + ':' + end

        if(!cache[key]){
            cache[key] = read(start, end).then(res=>{
                if(res.length < end - start) throw new Error('short read ' + res.length + '/' + (end - start) + ' at ' + start)

                return res
            })
        }

        return cache[key]
    }

    let isZero = (b)=>{
        for(let i = 0; i < b.length; i++) if(b[i] !== 0) return false

        return b.length > 0
    }

    if(head.length < 12) return []

    let tag = u32(head, 0)
    let offsets = []

    if(tag === TAG_TTC){
        let n = Math.min(u32(head, 8), 64)
        let h = await get(0, 12 + n * 4)

        for(let i = 0; i < n; i++) offsets.push(u32(h, 12 + i * 4))
    }
    else if(tag === TAG_TTF || tag === TAG_OTTO || tag === TAG_TRUE){
        offsets.push(0)
    }
    else{
        let bad = []

        bad.trace = ['size=' + size + ' head=' + head.length + 'B tag=0x' + tag.toString(16) + ' (not a TTF/OTF/TTC)']
        bad.zeros = isZero(head.subarray(0, 64))

        return bad
    }

    let out    = []
    let tables = {}
    let trace  = []

    trace.push('size=' + size + ' head=' + head.length + 'B tag=0x' + tag.toString(16) + ' faces=' + offsets.length)

    if(isZero(head.subarray(0, 64))) out.zeros = true

    for(let i = 0; i < offsets.length; i++){
        let off = offsets[i]
        let hdr = await get(off, off + 12)

        if(hdr.length < 12) continue

        let num = u16(hdr, 4)

        trace.push('face ' + i + ': tables=' + num)

        if(!num || num > 200) continue

        let dir = await get(off + 12, off + 12 + num * 16)
        let rec = null

        for(let t = 0; t < num; t++){
            let p = t * 16

            if(p + 16 > dir.length) break

            if(tag4(dir, p) === 'name') rec = {offset: u32(dir, p + 8), length: u32(dir, p + 12)}
        }

        if(!rec || rec.offset + 6 > size){
            trace.push('face ' + i + ': no name table' + (rec ? ' (offset ' + rec.offset + ' beyond file)' : ''))

            continue
        }

        // у начертаний из одной коллекции таблица имён часто общая - читаем один раз
        let tkey = rec.offset + ':' + rec.length

        if(!tables[tkey]){
            let nt = await get(rec.offset, rec.offset + Math.min(rec.length, MAX_NAME_TABLE))

            tables[tkey] = parseNameTable(nt)

            if(isZero(nt.subarray(0, Math.min(nt.length, 64)))) out.zeros = true

            let hex = Array.prototype.slice.call(nt.subarray(0, 12)).map(b=> (b < 16 ? '0' : '') + b.toString(16)).join(' ')

            trace.push('name table @' + rec.offset + '+' + rec.length + ' read ' + nt.length + 'B, head: ' + hex + ', names: ' + (tables[tkey] ? tables[tkey].names.length : 0))
        }

        if(tables[tkey]) out.push(Object.assign({index: i}, tables[tkey]))
    }

    out.trace = trace

    return out
}

export default {
    readNames,
    parseNameTable,
    weightOf
}
