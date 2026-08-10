import Arrays from '../../utils/arrays'
import Subscribe from '../../utils/subscribe'
import Player from '../player'

let listener = Subscribe()
let segments = {
    ad: [],
    skip: []
}

let origin = {
    ad: [],
    skip: []
}

let ref_duration = 0
let skip_preview_lead = 5

function init(){
    Player.listener.follow('start', (data)=>{
        if(data.segments) set(data.segments)
    })

    Player.listener.follow('destroy', destroy)
}

function update(time){
    let skip = get(time)

    if(skip && !skip.segment.viewed){
        skip.segment.viewed = true

        listener.send('skip', skip)
    }
}

function parseDurationMs(val){
    val = parseFloat(val)

    if(isNaN(val) || val <= 0) return 0

    return val / 1000
}

function set(new_segments){
    origin = {
        ad: [],
        skip: []
    }
    ref_duration = 0

    if(typeof new_segments === 'number'){
        ref_duration = parseDurationMs(new_segments)
    }
    else if(typeof new_segments === 'string' && new_segments && !isNaN(parseFloat(new_segments))){
        ref_duration = parseDurationMs(new_segments)
    }
    else if(Arrays.isObject(new_segments)){
        for(let i in new_segments){
            if(i == 'duration_ms'){
                ref_duration = parseDurationMs(new_segments[i])
            }
            else if(Arrays.isArray(new_segments[i])){
                origin[i] = new_segments[i].map((seg)=> Object.assign({}, seg))
            }
        }
    }

    segments = clone(origin)

    listener.send('set', segments)
}

function clone(source){
    let result = {}

    for(let i in source) result[i] = source[i].map((seg)=> Object.assign({}, seg))

    return result
}

function skipHeadSegment(source){
    if(!source.skip || !source.skip.length) return null

    let head = null

    for(let j = 0; j < source.skip.length; j++){
        let seg = source.skip[j]

        if(!head || (seg.start || 0) < (head.start || 0)) head = seg
    }

    return head
}

function introSkipSegment(source){
    if(!source.skip || !source.skip.length) return null

    let head = null
    let limit = ref_duration > 0 ? ref_duration * 0.45 : Infinity

    for(let j = 0; j < source.skip.length; j++){
        let seg = source.skip[j]
        let start = seg.start || 0

        // Логотип/бампер в первые секунды — не заставка серии.
        if(start < 30) continue
        if(start > limit) continue

        if(!head || start > (head.start || 0)) head = seg
    }

    return head || skipHeadSegment(source)
}

function tailSkipSegment(source){
    if(!source.skip || !source.skip.length) return null

    let tail = null
    let limit = ref_duration > 0 ? ref_duration * 0.55 : Infinity

    for(let j = 0; j < source.skip.length; j++){
        let seg = source.skip[j]
        let start = seg.start || 0

        // Титры у конца эталона — не бампер/промо с 0 с.
        if(start < 30) continue
        if(ref_duration > 0 && start < limit) continue

        if(!tail || (seg.end || 0) > (tail.end || 0)) tail = seg
    }

    return tail
}

function mapSegment(seg, duration, is_tail, credit_ref_len, tail_start){
    let start = seg.start || 0
    let end   = seg.end || 0

    if(!ref_duration) return Object.assign({}, seg)

    // Почти эталон — метки.
    if(Math.abs(duration - ref_duration) <= 2){
        return Object.assign({}, seg)
    }

    let slack = duration - ref_duration

    // Короче эталона — в начале урезано, якорь с конца уводит заставку раньше.
    if(slack < 0){
        return Object.assign({}, seg)
    }

    if(is_tail){
        let credit_len = Math.max(1, end - start)
        let mapped_start = duration - credit_len

        // Лишняя длина чаще в начале — титры фикс. длины у конца файла.
        if(credit_ref_len > 0 && slack < credit_ref_len){
            mapped_start -= Math.floor(slack * 0.3)
        }

        return {
            start: Math.max(0, Math.min(duration - 1, mapped_start)),
            end: duration
        }
    }

    // Бампер 0–30 с не сдвигаем.
    if(start < 30) return Object.assign({}, seg)

    // Малый slack (+3…20 с) — часть offset в титрах, заставка ближе к title card.
    if(slack <= 20 && tail_start > start){
        let width  = (end - start) || 1
        let base   = duration - (ref_duration - start)
        let booster = slack <= 10 ? Math.floor(slack * 2) : Math.floor(slack * 0.75)
        let guide  = start + Math.floor(start / 45) + booster
        let mapped = Math.max(base, guide)

        let copy = {
            start: mapped,
            end: mapped + width
        }

        copy.start = Math.max(0, Math.min(duration, copy.start))
        copy.end   = Math.max(copy.start + 1, Math.min(duration, copy.end))

        return copy
    }

    let copy = {
        start: duration - (ref_duration - start),
        end: duration - (ref_duration - end)
    }

    // Средний slack — часть offset в титрах, заставка ближе к контенту.
    if(credit_ref_len > 0 && slack < credit_ref_len){
        let width    = (end - start) || 1
        let base     = duration - (ref_duration - start)
        let anchor   = start + Math.floor(slack * 0.84)
        let softened = start + Math.floor(start / 45) + Math.floor(slack * 0.52)

        if(base > anchor){
            copy.start = anchor
        }
        else{
            copy.start = base + Math.floor(slack * 0.2)
        }

        if(slack >= 100 && softened > start && softened < copy.start){
            copy.start = softened
        }

        copy.end = copy.start + width
    }

    copy.start = Math.max(0, Math.min(duration, copy.start))
    copy.end   = Math.max(copy.start + 1, Math.min(duration, copy.end))

    return copy
}

function keepEarlySkip(seg, list){
    let start = seg.start || 0
    let end   = seg.end || 0

    if(start >= 30) return true

    // Убираем только дубль заставки: пересечение или «хвост» в зону intro.
    for(let j = 0; j < list.length; j++){
        let other  = list[j]
        let oStart = other.start || 0

        if(oStart < 30) continue

        let oEnd = other.end || 0

        if(end > oStart && start < oEnd) return false
        if(end > oStart + 15) return false
    }

    return true
}

function shouldKeepSkipSegment(seg, list, anchor){
    let start = seg.start || 0
    let end   = seg.end || 0

    if(!keepEarlySkip(seg, list)) return false

    if(end >= ref_duration - 60) return true

    if(start >= anchor - 1) return true

    // Бампер/лого до заставки — отдельная зона, не дубль intro.
    if(end <= anchor + 15) return true

    return false
}

function pruneSkipDuplicates(){
    if(!segments.skip || !segments.skip.length) return

    let intro = introSkipSegment(segments)

    if(!intro) return

    let anchor = intro.start || 0

    segments.skip = segments.skip.filter((seg)=> shouldKeepSkipSegment(seg, segments.skip, anchor))
}

function skipSegmentsUi(){
    let skips = [].concat(segments.skip || [], segments.ad || [])

    if(!skips.length) return []

    let intro = introSkipSegment(segments)

    if(!intro) return skips

    let anchor = intro.start || 0

    return skips.filter((seg)=> shouldKeepSkipSegment(seg, skips, anchor))
}

function scanSkip(time, lead, preview){
    let list = skipSegmentsUi()

    if(!list.length) return preview ? false : null

    let nearest = false

    for(let j = 0; j < list.length; j++){
        let seg = list[j]

        if(seg.skiped) continue

        if(time >= seg.start && time <= seg.end){
            if(preview) return {type: 'skip', segment: seg, phase: 'inside'}

            return {type: 'skip', segment: seg}
        }

        if(preview && time >= seg.start - lead && time < seg.start){
            let item = {
                type: 'skip',
                segment: seg,
                phase: 'preview',
                starts_in: Math.max(1, Math.ceil(seg.start - time))
            }

            if(!nearest || seg.start < nearest.segment.start) nearest = item
        }
    }

    return nearest
}

function adjust(duration){
    duration = parseFloat(duration)

    let valid = Boolean(duration) && !isNaN(duration)

    if(!valid || !ref_duration){
        segments = clone(origin)

        listener.send('set', segments)

        return
    }

    let tail = tailSkipSegment(origin)
    let credit_ref_len = tail ? Math.max(0, (tail.end || 0) - (tail.start || 0)) : 0
    let tail_start     = tail ? (tail.start || 0) : 0
    let tail_at_ref    = tail
        && Math.abs((tail.end || 0) - ref_duration) <= 15
        && (tail.start || 0) >= ref_duration - Math.max(credit_ref_len, 60) - 15

    segments = {}

    for(let i in origin){
        segments[i] = origin[i].map((seg)=>{
            let is_tail = tail_at_ref && seg === tail

            return mapSegment(seg, duration, is_tail, credit_ref_len, tail_start)
        })
    }

    pruneSkipDuplicates()

    listener.send('set', segments)
}

function get(time){
    let skip = scanSkip(time, skip_preview_lead, false)

    return skip || false
}

function getNear(time, lead){
    lead = parseFloat(lead)

    if(!lead || isNaN(lead)) lead = skip_preview_lead

    time = parseFloat(time) || 0

    let skip = scanSkip(time, lead, true)

    if(skip) return skip

    for(let i in segments){
        if(i == 'skip') continue

        if(!segments[i]) continue

        for(let j = 0; j < segments[i].length; j++){
            let seg = segments[i][j]

            if(seg.skiped) continue

            if(time >= seg.start && time <= seg.end){
                return {type: i, segment: seg, phase: 'inside'}
            }

            if(time >= seg.start - lead && time < seg.start){
                return {
                    type: i,
                    segment: seg,
                    phase: 'preview',
                    starts_in: Math.max(1, Math.ceil(seg.start - time))
                }
            }
        }
    }

    return false
}

function all(){
    return segments
}

function destroy(){
    segments = {
        ad: [],
        skip: []
    }

    origin = {
        ad: [],
        skip: []
    }
}

export default {
    init,
    listener,
    update,
    set,
    adjust,
    get,
    getNear,
    all,
    destroy
}
