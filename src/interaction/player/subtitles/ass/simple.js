import Parser from './parser'

/**
 * Простой рендерер ASS на DOM/CSS (без WASM и воркеров).
 *
 * Поддерживает: стили (шрифт, размер, ScaleY, цвета с прозрачностью, bold/italic/underline/strike, интервал),
 * контур и тень (текст-тенями), BorderStyle 3 (подложка), Alignment, поля, \an, \pos, \move, \fad,
 * простое караоке (\k/\kf/\ko - мгновенная смена цвета), многослойность (Layer),
 * вертикальное «раздвигание» событий с одинаковым выравниванием, как это делает libass.
 *
 * Не поддерживает: \t (анимации), \clip, рисование (\p), вращение, размытие, ScaleX ≠ ScaleY, эффекты Banner/Scroll.
 *
 * Шрифты из торрента (host.fonts) подключаются через FontFace; пока шрифт не загрузился, используется запасной.
 * Коллекции .ttc браузеры в FontFace не поддерживают - такие шрифты пропускаются.
 *
 * Хост (интерфейс окружения):
 *   host.parent  - элемент, в который добавляется слой
 *   host.fonts   - (необязательно) сессия подбора шрифтов: on(callback)
 *   host.time()  - текущее время видео в секундах (уже со сдвигом субтитров)
 *   host.rect()  - {left, top, width, height} картинки видео в координатах окна
 *   host.videoHeight() - (необязательно) высота видео в пикселях
 */

let measure_ctx = null
let em_cache    = {}

/**
 * Коэффициент перевода «высоты ячейки» ASS (ascent+descent = размер шрифта) в CSS font-size
 */
function emFactor(family){
    if(em_cache[family] !== undefined) return em_cache[family]

    let factor = 0.88

    try{
        if(!measure_ctx) measure_ctx = document.createElement('canvas').getContext('2d')

        measure_ctx.font = '100px ' + family

        let m = measure_ctx.measureText('Hgyp')

        if(m.fontBoundingBoxAscent !== undefined){
            let h = m.fontBoundingBoxAscent + m.fontBoundingBoxDescent

            if(h > 0) factor = 100 / h
        }
    }
    catch(e){}

    em_cache[family] = factor

    return factor
}

function fontStack(name, fallback){
    let n   = String(name || '').replace(/^@/, '').replace(/["']/g, '')
    let low = n.toLowerCase()
    let gen = /times|georgia|garamond|palatino|cambria|serif/.test(low) && !/sans/.test(low) ? 'serif' : 'sans-serif'

    return '"' + n + '", ' + (fallback ? fallback + ', ' : '') + gen
}

function rgba(c, mul){
    let a = c.a * (mul === undefined ? 1 : mul)

    return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + Math.round(a * 1000) / 1000 + ')'
}

function round(v){
    return Math.round(v * 100) / 100
}

/**
 * Контур через набор text-shadow по окружности (работает везде, в отличие от paint-order)
 */
function outlineShadows(r, color, dx, dy){
    let out = []

    dx = dx || 0
    dy = dy || 0
    let add = (radius, n)=>{
        for(let k = 0; k < n; k++){
            let a = Math.PI * 2 * k / n

            out.push(round(Math.cos(a) * radius + dx) + 'px ' + round(Math.sin(a) * radius + dy) + 'px 0 ' + color)
        }
    }

    let n = Math.min(32, Math.max(8, Math.ceil(r * 3)))

    add(r, n)

    if(r >= 2.5) add(r / 2, Math.ceil(n / 2))

    return out
}

function alignParts(an){
    let h = (an - 1) % 3 // 0 left, 1 center, 2 right
    let v = Math.floor((an - 1) / 3) // 0 bottom, 1 middle, 2 top

    return {h, v}
}

function SimpleAss(host){
    let doc       = null
    let root      = document.createElement('div')
    let regions   = {}
    let pos_layer = document.createElement('div')
    let nodes     = {}
    let animated  = []
    let active_key = null
    let last_t     = null
    let last_rect  = null
    let last_layout_check = 0
    let last_run   = 0
    let raf        = 0
    let running    = false
    let scale      = {sx: 1, sy: 1, bs: 1}

    let faces     = []
    let destroyed = false

    this.fallbackFont = ''
    this.minInterval  = 0

    root.className = 'player-video__ass'
    root.style.cssText = 'position:fixed;overflow:hidden;pointer-events:none;display:none;'

    pos_layer.style.cssText = 'position:absolute;left:0;top:0;right:0;bottom:0;'

    // 9 областей для событий без \pos, внутри них события выстраиваются друг над другом
    for(let an = 1; an <= 9; an++){
        let r = document.createElement('div')
        let p = alignParts(an)

        if(p.v === 0)      r.style.cssText = 'position:absolute;left:0;right:0;bottom:0;display:flex;flex-direction:column-reverse;'
        else if(p.v === 2) r.style.cssText = 'position:absolute;left:0;right:0;top:0;display:flex;flex-direction:column;'
        else               r.style.cssText = 'position:absolute;left:0;right:0;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center;'

        regions[an] = r

        root.appendChild(r)
    }

    root.appendChild(pos_layer)
    host.parent.appendChild(root)

    const self = this

    /**
     * Подключить шрифт из торрента под именем, которое используется в ASS
     */
    function addFont(f){
        if(f.ttc || typeof FontFace === 'undefined' || !document.fonts) return

        f.as.forEach(name=>{
            let face = new FontFace(name, 'url("' + f.url + '")', {weight: String(f.weight || 400), style: f.italic ? 'italic' : 'normal'})

            face.load().then(()=>{
                if(destroyed) return

                document.fonts.add(face)

                faces.push(face)

                // размеры текста зависят от метрик шрифта - пересчитываем всё
                em_cache = {}

                self.invalidate()
            }).catch(()=>{})
        })
    }

    if(host.fonts) host.fonts.on(addFont)

    /**
     * Узлы
     */
    function clearNodes(){
        for(let k in nodes){
            if(nodes[k] && nodes[k].el.parentNode) nodes[k].el.parentNode.removeChild(nodes[k].el)
        }

        nodes      = {}
        animated   = []
        active_key = null
    }

    function segmentStyle(p, model){
        let family = fontStack(p.font, self.fallbackFont)
        let fs     = p.size * scale.sy * p.scaleY
        let css    = []

        css.push('font-family:' + family)
        css.push('font-size:' + round(fs * emFactor(family)) + 'px')
        css.push('line-height:' + round(fs) + 'px')
        css.push('font-weight:' + (p.bold ? 700 : 400))
        css.push('font-style:' + (p.italic ? 'italic' : 'normal'))

        if(p.underline || p.strike) css.push('text-decoration:' + (p.underline ? 'underline ' : '') + (p.strike ? 'line-through' : ''))

        if(p.spacing) css.push('letter-spacing:' + round(p.spacing * scale.sx) + 'px')

        css.push('color:' + rgba(p.c1))

        let outline = p.outline * scale.bs
        let shadow  = p.shadow * scale.bs

        if(model.style.borderStyle === 3){
            // непрозрачная подложка цвета контура
            css.push('background:' + rgba(p.c3))
            // отступ только по горизонтали: по вертикали боксы соседних строк иначе перекрываются и темнеют
            css.push('padding:0 ' + round(Math.max(outline, 1)) + 'px')
        }
        else{
            let list = []

            if(outline > 0) list = list.concat(outlineShadows(outline, rgba(p.c3)))

            if(shadow > 0){
                if(outline > 0) list = list.concat(outlineShadows(outline, rgba(p.c4), shadow, shadow))
                else            list.push(round(shadow) + 'px ' + round(shadow) + 'px 0 ' + rgba(p.c4))
            }

            if(list.length) css.push('text-shadow:' + list.join(','))
        }

        return css.join(';')
    }

    function createNode(ev){
        let model = Parser.getModel(ev, doc)

        if(!model.hasText) return null

        let an      = model.an
        let ap      = alignParts(an)
        let info    = doc.info
        let el      = document.createElement('div')
        let node    = {el, ev, model, an, fade: null, move: null, kara: []}
        let align   = ap.h === 0 ? 'left' : ap.h === 1 ? 'center' : 'right'
        let nowrap  = model.wrap === 2 || Boolean(model.pos || model.move)
        let css     = ['font-size:0', 'line-height:0', 'text-align:' + align, 'white-space:' + (nowrap ? 'pre' : 'pre-wrap')]

        let mL = (ev.marginL || model.style.marginL) * scale.sx
        let mR = (ev.marginR || model.style.marginR) * scale.sx
        let mV = (ev.marginV || model.style.marginV) * scale.sy

        if(model.pos || model.move){
            css.push('position:absolute')
            css.push('transform:translate(' + (ap.h === 0 ? 0 : ap.h === 1 ? -50 : -100) + '%,' + (ap.v === 2 ? 0 : ap.v === 1 ? -50 : -100) + '%)')

            let x = model.pos ? model.pos[0] : model.move.x1
            let y = model.pos ? model.pos[1] : model.move.y1

            css.push('left:' + round(x * scale.sx) + 'px')
            css.push('top:' + round(y * scale.sy) + 'px')

            if(model.move) node.move = model.move
        }
        else{
            css.push('margin-left:' + round(mL) + 'px')
            css.push('margin-right:' + round(mR) + 'px')

            if(ap.v === 0)      css.push('margin-bottom:' + round(mV) + 'px')
            else if(ap.v === 2) css.push('margin-top:' + round(mV) + 'px')
        }

        css.push('z-index:' + ev.layer)

        el.style.cssText = css.join(';')

        // разбиваем сегменты на строки по \N
        let lines = [[]]

        model.segments.forEach(seg=>{
            let parts = seg.text.split('\n')

            parts.forEach((part, i)=>{
                if(i > 0) lines.push([])

                lines[lines.length - 1].push({text: part, p: seg.p})
            })
        })

        lines.forEach(line=>{
            let ld = document.createElement('div')

            let first = line.length ? line[0].p : model.segments[0].p

            if(!line.length || line.every(s=> s.text === '')){
                let sp = document.createElement('span')

                sp.style.cssText = segmentStyle(first, model)
                sp.textContent = '\u00a0'

                ld.appendChild(sp)
            }
            else{
                line.forEach(s=>{
                    if(s.text === '') return

                    let sp = document.createElement('span')

                    sp.style.cssText = segmentStyle(s.p, model)
                    sp.textContent   = s.text

                    if(s.p.kt){
                        node.kara.push({el: sp, p: s.p, state: -1})

                        sp.style.color = rgba(s.p.c2)
                    }

                    ld.appendChild(sp)
                })
            }

            el.appendChild(ld)
        })

        if(model.fad) node.fade = model.fad

        if(node.fade || node.move || node.kara.length) animated.push(node)

        return node
    }

    function findActive(t){
        let ev = doc.events
        let lo = 0
        let hi = ev.length

        while(lo < hi){
            let mid = (lo + hi) >> 1

            if(ev[mid].start <= t) lo = mid + 1
            else                   hi = mid
        }

        let out = []
        let min = t - doc.maxDuration

        for(let i = lo - 1; i >= 0; i--){
            if(ev[i].start < min) break

            if(ev[i].end > t) out.push(ev[i])
        }

        out.sort((a, b)=> a.layer - b.layer || a.order - b.order)

        return out
    }

    function sync(active){
        let next = {}

        active.forEach(ev=>{
            let node = nodes[ev.order]

            if(node === undefined){
                node = createNode(ev)

                nodes[ev.order] = node || false
            }

            if(node) next[ev.order] = node
        })

        for(let k in nodes){
            if(nodes[k] && !next[k]){
                if(nodes[k].el.parentNode) nodes[k].el.parentNode.removeChild(nodes[k].el)

                let idx = animated.indexOf(nodes[k])

                if(idx >= 0) animated.splice(idx, 1)

                delete nodes[k]
            }
        }

        active.forEach(ev=>{
            let node = next[ev.order]

            if(!node) return

            let target = (node.model.pos || node.model.move) ? pos_layer : regions[node.an]

            target.appendChild(node.el)
        })
    }

    function animate(t){
        for(let i = 0; i < animated.length; i++){
            let n  = animated[i]
            let ev = n.ev
            let ms = (t - ev.start) * 1000

            if(n.fade){
                let dur = (ev.end - ev.start) * 1000
                let op  = 1

                if(n.fade[0] > 0 && ms < n.fade[0]) op = Math.max(0, ms / n.fade[0])

                if(n.fade[1] > 0 && dur - ms < n.fade[1]) op = Math.min(op, Math.max(0, (dur - ms) / n.fade[1]))

                n.el.style.opacity = String(Math.round(op * 100) / 100)
            }

            if(n.move){
                let m  = n.move
                let t1 = m.t1
                let t2 = m.t2 || (ev.end - ev.start) * 1000
                let k  = t2 > t1 ? Math.min(1, Math.max(0, (ms - t1) / (t2 - t1))) : 1

                n.el.style.left = round((m.x1 + (m.x2 - m.x1) * k) * scale.sx) + 'px'
                n.el.style.top  = round((m.y1 + (m.y2 - m.y1) * k) * scale.sy) + 'px'
            }

            if(n.kara.length){
                let cs = ms / 10

                n.kara.forEach(k=>{
                    let sung = cs >= k.p.ks ? 1 : 0

                    if(sung !== k.state){
                        k.state = sung

                        k.el.style.color = rgba(sung ? k.p.c1 : k.p.c2)
                    }
                })
            }
        }
    }

    function layout(force){
        let r = host.rect()

        if(!r || !r.width || !r.height) return false

        if(!force && last_rect && Math.abs(r.left - last_rect.left) < 0.5 && Math.abs(r.top - last_rect.top) < 0.5 &&
            Math.abs(r.width - last_rect.width) < 0.5 && Math.abs(r.height - last_rect.height) < 0.5) return true

        last_rect = {left: r.left, top: r.top, width: r.width, height: r.height}

        root.style.left   = r.left + 'px'
        root.style.top    = r.top + 'px'
        root.style.width  = r.width + 'px'
        root.style.height = r.height + 'px'

        if(doc){
            let sx = r.width / doc.info.playResX
            let sy = r.height / doc.info.playResY
            let vh = host.videoHeight ? host.videoHeight() : 0

            scale = {sx, sy, bs: doc.info.scaledBorder ? sy : (vh ? r.height / vh : sy)}
        }

        clearNodes()

        last_t = null

        return true
    }

    function tick(now){
        if(!running) return

        raf = requestAnimationFrame(tick)

        if(self.minInterval && now - last_run < self.minInterval) return

        last_run = now

        if(!doc) return

        if(now - last_layout_check > 300 || !last_rect){
            last_layout_check = now

            if(!layout(false)) return
        }

        let t = host.time()

        if(t === last_t) return

        last_t = t

        let active = findActive(t)
        let key    = active.map(e=> e.order).join(',')

        if(key !== active_key){
            active_key = key

            sync(active)
        }

        animate(t)
    }

    /**
     * Загрузить текст ASS
     * @param {string} text
     */
    this.load = function(text){
        doc = Parser.parse(text)

        clearNodes()

        last_rect = null

        root.style.display = 'block'

        this.start()
    }

    this.start = function(){
        if(running) return

        running = true

        raf = requestAnimationFrame(tick)
    }

    this.stop = function(){
        running = false

        cancelAnimationFrame(raf)

        clearNodes()

        root.style.display = 'none'
    }

    /**
     * Принудительно пересчитать размеры (например, после смены размера окна)
     */
    this.invalidate = function(){
        last_rect = null
    }

    /**
     * Вызвать один кадр вручную (для тестов)
     */
    this.renderAt = function(){
        last_t = null

        tick(performance.now() + 1000)
    }

    this.destroy = function(){
        destroyed = true

        faces.forEach(face=>{
            try{
                document.fonts.delete(face)
            }
            catch(e){}
        })

        faces = []

        this.stop()

        if(root.parentNode) root.parentNode.removeChild(root)

        doc = null
    }

    this.element = root
}

export default SimpleAss
