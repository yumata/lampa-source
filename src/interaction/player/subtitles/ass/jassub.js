import Utils from '../../../../utils/utils'
import Manifest from '../../../../core/manifest'
import Platform from '../../../../core/platform'
import Storage from '../../../../core/storage/storage'

/**
 * Полноценный рендерер ASS на базе JASSUB (libass в WebAssembly).
 *
 * Файлы библиотеки (dist пакета jassub 1.8.x) лежат в public/vender/jassub/ и подгружаются лениво,
 * только когда нужно показать ASS-дорожку.
 *
 * Для разработки можно указать свой каталог: Lampa.Storage.set('jassub_path', 'http://localhost:8080/vender/jassub/')
 */

const UMD_FILES = ['jassub.umd.js', 'jassub.js']

let loading    = null
let lib_failed = false

function absolute(url){
    try{
        return new URL(url, document.baseURI).href
    }
    catch(e){
        return url
    }
}

function withSlash(url){
    return String(url).replace(/\/+$/, '') + '/'
}

/**
 * Каталоги, где может лежать JASSUB, в порядке попыток (всегда абсолютные адреса со слэшем на конце):
 *  1. jassub_path - явный адрес (для разработки), других вариантов тогда нет;
 *  2. последний рабочий каталог (запоминается после полностью удачной загрузки);
 *  3. виджеты (file://) и расширения: сначала сервер (Manifest.github_lampa), потому что локальная vender заморожена
 *     на момент сборки, а fetch/Worker на file:// ограничены; сайты: сначала свои файлы ./vender/jassub/;
 *  4. оставшийся вариант как запасной.
 */
function candidates(){
    let custom = String(Storage.get('jassub_path', '') || '').trim()

    if(custom) return [absolute(withSlash(custom))]

    let remote = absolute(withSlash(Manifest.github_lampa || '') + 'vender/jassub/')
    let local  = absolute('./vender/jassub/')
    let loc    = window.location || {}
    let widget = loc.protocol === 'file:' || String(loc.href || '').indexOf('chrome-extension') > -1
    let list   = widget ? [remote, local] : [local, remote]
    let saved  = String(Storage.get('jassub_base', '') || '')

    if(saved && list.indexOf(saved) >= 0) list = [saved].concat(list.filter(b=> b !== saved))

    return list.filter((b, i)=> list.indexOf(b) === i)
}

function loadScript(dir, index, resolve, reject){
    if(index >= UMD_FILES.length) return reject(new Error('script not found in ' + dir))

    Utils.putScriptAsync([dir + UMD_FILES[index]], false, ()=>{
        loadScript(dir, index + 1, resolve, reject)
    }, resolve)
}

/**
 * Каталог на том же адресе (origin), что и страница: воркер можно запускать напрямую, без Blob и CORS
 */
function sameOrigin(dir){
    try{
        return new URL(dir).origin === (window.location || {}).origin
    }
    catch(e){
        return false
    }
}

/**
 * Проверить, что wasm доступен (иначе воркер упадёт уже после «успешной» загрузки скрипта)
 */
function probe(url){
    return fetch(url, {method: 'HEAD'}).then(r=>{
        if(!r.ok) throw new Error('wasm ' + r.status)
    })
}

/**
 * Попытка загрузить библиотеку из одного каталога: скрипт, воркер, доступность wasm
 * @returns {Promise<{JASSUB:function, workerUrl:string, dir:string}>}
 */
function tryDir(dir){
    return new Promise((resolve, reject)=>{
        loadScript(dir, 0, ()=>{
            let J = window.JASSUB

            if(J && typeof J !== 'function' && typeof J.default === 'function') J = J.default

            if(typeof J !== 'function') return reject(new Error('JASSUB global not found'))

            let worker = sameOrigin(dir) ? Promise.resolve(dir + 'jassub-worker.js') : fetch(dir + 'jassub-worker.js').then(r=>{
                if(!r.ok) throw new Error('worker ' + r.status)

                return r.text()
            }).then(code=> URL.createObjectURL(new Blob([code], {type: 'application/javascript'})))

            worker.then(workerUrl=>{
                return probe(dir + 'jassub-worker.wasm').then(()=> resolve({JASSUB: J, workerUrl, dir}))
            }).catch(reject)
        }, reject)
    })
}

/**
 * Загрузить библиотеку: перебор каталогов, рабочий запоминается
 * @returns {Promise<{JASSUB:function, workerUrl:string, dir:string}>}
 */
function loadLib(){
    if(loading) return loading

    let list   = candidates()
    let errors = []

    let next = (i)=>{
        if(i >= list.length) return Promise.reject(new Error(errors.join('; ') + '. Install files to public/vender/jassub or set Lampa.Storage.set(\'jassub_path\', \'http://host/vender/jassub/\')'))

        return tryDir(list[i]).then((lib)=>{
            // запоминаем только автоматически найденный каталог (свой jassub_path запоминать не нужно)
            if(list.length > 1 && Storage.get('jassub_base', '') !== lib.dir) Storage.set('jassub_base', lib.dir)

            return lib
        }).catch((e)=>{
            errors.push(list[i] + ' - ' + (e && e.message ? e.message : e))

            // запомненный каталог перестал работать - забываем его
            if(Storage.get('jassub_base', '') === list[i]) Storage.set('jassub_base', '')

            return next(i + 1)
        })
    }

    loading = next(0)

    loading.catch((e)=>{
        loading    = null
        lib_failed = true

        console.log('Subtitles', 'JASSUB load error', e && e.message ? e.message : e)
    })

    return loading
}

/**
 * Можно ли использовать этот рендерер
 * @param {boolean} forced - режим выбран вручную («Полный»), а не «Авто»
 */
function supported(forced){
    if(lib_failed) return false

    let ok = typeof WebAssembly === 'object' && typeof Worker !== 'undefined' && typeof fetch === 'function' &&
        typeof Blob !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function'

    if(!ok) return false

    if(forced) return true

    // в автоматическом режиме не нагружаем ТВ и старые браузеры, там лучше простой рендерер
    if(Platform.tv()) return false

    let v = Platform.chromeVersion()

    if(v && v < 80) return false

    return true
}

function shift(){
    let s = parseInt(Storage.get('player_subs_shift_time', '0'))

    return isNaN(s) ? 0 : s
}

// сколько ждать подбора шрифтов перед созданием рендерера (мс); найденные позже шрифты добавляются перезапуском
const FONTS_WAIT = 2500
const MAX_REBUILDS = 2

function Renderer(host){
    let inst       = null
    let destroyed  = false
    let timer      = null
    let last_shift = null
    let included   = {}
    let rebuilds   = 0
    let rebuild_timer = null
    let source     = ''
    let lib        = null

    let fontLists = ()=>{
        let fonts     = []
        let available = {'liberation sans': lib.dir + 'default.woff2'}

        included = {}

        if(host.fonts){
            host.fonts.fonts.forEach(f=>{
                included[f.url] = true

                if(f.lazy){
                    // крупные шрифты libass запрашивает только когда они понадобятся
                    f.as.concat([f.family]).forEach(n=>{
                        if(n) available[String(n).toLowerCase()] = f.url
                    })
                }
                else fonts.push(f.url)
            })
        }

        return {fonts, available}
    }

    let destroyInst = ()=>{
        clearInterval(timer)

        if(inst){
            try{
                inst.destroy()
            }
            catch(e){}

            inst = null
        }
    }

    let create = ()=>{
        if(destroyed) return

        let lists = fontLists()

        last_shift = shift()

        inst = new lib.JASSUB({
            video: host.video,
            subContent: source,
            workerUrl: lib.workerUrl,
            wasmUrl: lib.dir + 'jassub-worker.wasm',
            legacyWasmUrl: lib.dir + 'jassub-worker.wasm.js',
            modernWasmUrl: lib.dir + 'jassub-worker-modern.wasm',
            fonts: lists.fonts,
            availableFonts: lists.available,
            timeOffset: -last_shift
        })

        // JASSUB прибавляет timeOffset к времени видео, а сдвиг Lampa - это задержка субтитров
        timer = setInterval(()=>{
            let s = shift()

            if(s !== last_shift && inst){
                last_shift = s

                inst.timeOffset = -s
            }
        }, 1000)

        if(inst._worker && inst._worker.addEventListener){
            inst._worker.addEventListener('error', ()=>{
                if(host.onFail) host.onFail()
            })
        }
    }

    // шрифт нашёлся уже после создания рендерера - пересоздаём его с полным набором (не чаще MAX_REBUILDS раз)
    let onLateFont = (f)=>{
        if(destroyed || !inst || included[f.url] || rebuilds >= MAX_REBUILDS) return

        clearTimeout(rebuild_timer)

        rebuild_timer = setTimeout(()=>{
            if(destroyed) return

            rebuilds++

            destroyInst()

            create()
        }, 500)
    }

    this.load = (text)=>{
        source = text

        let fonts_ready = host.fonts ? Promise.race([host.fonts.done, new Promise(resolve=> setTimeout(resolve, FONTS_WAIT))]) : Promise.resolve()

        Promise.all([loadLib(), fonts_ready]).then((res)=>{
            if(destroyed) return

            lib = res[0]

            create()

            if(host.fonts) host.fonts.on(onLateFont)
        }).catch(()=>{
            if(!destroyed && host.onFail) host.onFail()
        })
    }

    this.invalidate = ()=>{
        if(inst && typeof inst.resize === 'function') inst.resize()
    }

    this.destroy = ()=>{
        destroyed = true

        clearTimeout(rebuild_timer)

        destroyInst()
    }
}

export default {
    create: (host)=> new Renderer(host),
    supported,
    candidates
}
