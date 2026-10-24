import Parser from './parser'
import Sfnt from './sfnt'

/**
 * Подбор шрифтов из торрента под конкретный ASS-файл.
 *
 * 1. Из ASS берутся имена шрифтов (поле Fontname в стилях и теги \fn).
 * 2. Из списка файлов торрента выбираются файлы шрифтов (ttf/otf/ttc/otc).
 * 3. У каждого шрифта читается таблица имён (через Range-запросы, без загрузки файла целиком).
 * 4. Подходящие шрифты отдаются рендерерам по мере нахождения.
 *
 * Работа с сетью вынесена в transport:
 *   transport.listFiles(hash)        -> Promise<[{id, path, length}]>
 *   transport.url(hash, file)        -> адрес файла
 *   transport.range(url, start, end) -> Promise<Uint8Array>
 */

const FONT_RE = /\.(ttf|otf|ttc|otc)$/i

// в первом проходе читаем только небольшие файлы, большие (например, CJK-коллекции) - только если ещё чего-то не нашли
const SMALL_SIZE = 3 * 1024 * 1024
// шрифты крупнее этого загружаются рендерером только по мере надобности (lazy)
const LAZY_SIZE = 3 * 1024 * 1024
const MIN_SIZE = 1024
// последовательно: параллельные чтения разных мест раздачи могут давать пустые данные (особенно пока торрент докачивается)
const CONCURRENCY = 1
const RETRY_DELAYS = [600, 1800]

const sleep = (ms)=> new Promise(resolve=> setTimeout(resolve, ms))

let file_lists = {}
let name_index = {}

function norm(s){
    return String(s || '').toLowerCase().replace(/[^a-z0-9\u0400-\u04ff\u3040-\u30ff\u4e00-\u9fff]+/g, '')
}

function cleanName(name){
    return String(name || '').replace(/^@/, '').replace(/^["'\s]+|["'\s]+$/g, '')
}

/**
 * Имена шрифтов, которые использует ASS
 * @param {string|object} source - текст ASS или уже разобранный документ
 * @returns {string[]} имена как в файле (без дублей, без учёта регистра)
 */
function usedFamilies(source){
    let doc  = typeof source === 'string' ? Parser.parse(source) : source
    let seen = {}
    let out  = []

    let add = (name)=>{
        name = cleanName(name)

        let key = name.toLowerCase()

        if(!name || seen[key]) return

        seen[key] = true

        out.push(name)
    }

    let used_styles = {}

    doc.events.forEach(ev=>{
        used_styles[ev.style] = true

        if(ev.text.indexOf('\\fn') >= 0){
            let re = /\\fn([^\\}]+)/g
            let m

            while((m = re.exec(ev.text)) !== null) add(m[1])
        }
    })

    Object.keys(doc.styles).forEach(name=>{
        if(used_styles[name] || (name === 'Default' && !doc.events.length)) add(doc.styles[name].font)
    })

    return out
}

/**
 * Какие из нужных имён подходят этому начертанию
 */
function matched(needed, entry){
    let have = {}

    entry.names.forEach(n=>{ have[n.toLowerCase()] = true })

    if(entry.family && entry.subfamily) have[(entry.family + ' ' + entry.subfamily).toLowerCase()] = true

    return needed.filter(n=> have[n.toLowerCase()])
}

function listFiles(transport, hash){
    if(!file_lists[hash]){
        file_lists[hash] = transport.listFiles(hash).then(list=>{
            return (list || []).filter(f=> f && FONT_RE.test(f.path || '') && f.length >= MIN_SIZE)
        })

        file_lists[hash].catch(()=>{ delete file_lists[hash] })
    }

    return file_lists[hash]
}

function hasNames(entries){
    return entries.some(e=> e.names.length > 0)
}

async function readFile(transport, hash, file){
    let short   = file.path.split('/').pop()
    let url     = transport.url(hash, file)
    let entries = await Sfnt.readNames((s, e)=> transport.range(url, s, e), file.length)
    let zeros   = entries.zeros

    if(hasNames(entries)) return entries

    console.log('Subtitles', 'fonts: ' + short + ' - range read gave no names [' + (entries.trace || []).join('; ') + ']')

    // пустые данные могут быть временными (торрент ещё докачивается) - повторяем с паузой
    for(let i = 0; i < RETRY_DELAYS.length; i++){
        await sleep(RETRY_DELAYS[i])

        entries = await Sfnt.readNames((s, e)=> transport.range(url, s, e), file.length)

        if(hasNames(entries)){
            console.log('Subtitles', 'fonts: ' + short + ' - names found on retry ' + (i + 1))

            return entries
        }

        zeros = zeros || entries.zeros
    }

    // запасной путь: небольшой файл проще скачать целиком
    if(transport.full && file.length <= SMALL_SIZE){
        let bytes = await transport.full(url)
        let again = await Sfnt.readNames(async(s, e)=> bytes.subarray(s, Math.min(e, bytes.length)), bytes.length)

        console.log('Subtitles', 'fonts: ' + short + ' - full download ' + bytes.length + 'B (expected ' + file.length + '): ' +
            (hasNames(again) ? 'names found' : 'still no names [' + (again.trace || []).join('; ') + ']'))

        if(hasNames(again)) return again

        zeros = zeros || again.zeros
        entries = again
    }

    if(zeros){
        console.log('Subtitles', 'fonts: ' + short + ' - the server returns empty (zero) bytes for this file; the file cannot be used. ' +
            'Check it directly: GET ' + url)
    }

    return entries
}

function fileNames(transport, hash, file){
    let key = hash + ':' + file.id

    if(!name_index[key]){
        name_index[key] = readFile(transport, hash, file)

        name_index[key].catch(()=>{ delete name_index[key] })
    }

    return name_index[key]
}

/**
 * Приоритет файла: сначала те, чьё имя похоже на нужный шрифт, затем по размеру
 */
function sortFiles(files, needed){
    let keys = needed.map(norm).filter(Boolean)

    let hint = (f)=>{
        let stem = norm((f.path.split('/').pop() || '').replace(/\.[^.]+$/, ''))

        if(!stem) return 0

        return keys.some(k=> k.indexOf(stem) >= 0 || stem.indexOf(k) >= 0) ? 1 : 0
    }

    return files.slice().sort((a, b)=> hint(b) - hint(a) || a.length - b.length)
}

/**
 * Запустить подбор шрифтов
 * @param {{hash:string, text:string, transport:object}} opts
 * @returns {{fonts:Array, on:function, done:Promise, cancel:function}}
 */
function createSession(opts){
    let listeners = []
    let fonts     = []
    let cancelled = false
    let finish
    let done      = new Promise(resolve=>{ finish = resolve })
    let needed    = []

    let session = {
        fonts,
        needed,
        done,
        /**
         * Подписка: колбэк вызывается для уже найденных шрифтов и для всех следующих
         */
        on(cb){
            listeners.push(cb)

            fonts.slice().forEach(f=> cb(f))
        },
        cancel(){
            cancelled = true

            listeners.length = 0

            finish()
        }
    }

    let emit = (font)=>{
        fonts.push(font)

        listeners.slice().forEach(cb=> cb(font))
    }

    let scan = async(files, unresolved)=>{
        let queue = files.slice()

        let worker = async()=>{
            while(queue.length && !cancelled){
                let file = queue.shift()
                let entries

                let short = file.path.split('/').pop()

                try{
                    entries = await fileNames(opts.transport, opts.hash, file)
                }
                catch(e){
                    console.log('Subtitles', 'fonts: cannot read ' + short + ': ' + (e && e.message ? e.message : e))

                    continue
                }

                if(cancelled) return

                if(!entries.length) console.log('Subtitles', 'fonts: ' + short + ' - no font names found')

                entries.forEach(entry=>{
                    let as = matched(needed, entry)

                    if(!as.length){
                        console.log('Subtitles', 'fonts: ' + short + ' - not needed (' + entry.names.slice(0, 4).join(' | ') + ', ' + entry.subfamily + ')')

                        return
                    }

                    as.forEach(n=>{ delete unresolved[n.toLowerCase()] })

                    emit({
                        url: opts.transport.url(opts.hash, file),
                        path: file.path,
                        size: file.length,
                        ttc: /\.(ttc|otc)$/i.test(file.path),
                        lazy: file.length > LAZY_SIZE,
                        as,
                        family: entry.family,
                        subfamily: entry.subfamily,
                        weight: entry.weight,
                        italic: entry.italic
                    })
                })
            }
        }

        let workers = []

        for(let i = 0; i < CONCURRENCY; i++) workers.push(worker())

        await Promise.all(workers)
    }

    let run = async()=>{
        let unresolved = {}

        try{
            needed.push.apply(needed, usedFamilies(opts.text))

            if(!needed.length) return

            let all = await listFiles(opts.transport, opts.hash)

            console.log('Subtitles', 'fonts: ' + all.length + ' font file(s) in torrent, looking for: ' + needed.join(', '))

            if(cancelled || !all.length) return

            needed.forEach(n=>{ unresolved[n.toLowerCase()] = true })

            let sorted = sortFiles(all, needed)
            let small  = sorted.filter(f=> f.length <= SMALL_SIZE)
            let big    = sorted.filter(f=> f.length > SMALL_SIZE)

            await scan(small, unresolved)

            if(!cancelled && big.length && Object.keys(unresolved).length) await scan(big, unresolved)
        }
        catch(e){
            console.log('Subtitles', 'fonts error', e && e.message ? e.message : e)
        }

        if(needed.length && !cancelled){
            console.log('Subtitles', 'fonts: found ' + fonts.length + ' file(s), not found: ' + (Object.keys(unresolved).join(', ') || '-'))
        }

        finish()
    }

    run()

    return session
}

export default {
    createSession,
    usedFamilies,
    matched
}
