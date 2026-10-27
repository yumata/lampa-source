/**
 * Расчёты для списка «История» (просмотры CUB, одна строка на карточку): число серий в сезонах, прогресс,
 * сезоны «досмотрены / сейчас / впереди», следующая серия и просмотры по дням. Без DOM и переводов — только данные
 */

const SESSION = 1000 * 60 * 60 * 3 // серии подряд в пределах 3 часов — одна строка в «Истории по дням»

/**
 * Серий в сезонах (без спецвыпусков, сезон 0)
 * @param {object} [detail] - карточка из idsview: seasons {"1": 13, "2": 22}; или TMDB tv/{id}: seasons [{season_number, episode_count}]
 * @param {array} [timetable] - серии из TimeTable.get(): [{season_number, episode_number}] — точнее для текущего сезона
 * @returns {object} - {1: 13, 2: 22, ...}
 */
function seasons(detail, timetable){
    let result = {}
    let list   = (detail && detail.seasons) || []

    if(!Array.isArray(list)) list = Object.keys(list).map(number=>({season_number: number, episode_count: list[number]}))

    list.forEach(s=>{
        let number = parseInt(s.season_number)
        let count  = parseInt(s.episode_count)

        if(number > 0 && count > 0) result[number] = count
    })

    let table = {}

    ;(timetable || []).forEach(e=>{
        let number = parseInt(e.season_number)
        let episode = parseInt(e.episode_number)

        if(number > 0 && episode > 0) table[number] = Math.max(table[number] || 0, episode)
    })

    for(let number in table) result[number] = table[number]

    return result
}

/**
 * Прогресс сериала
 * @param {object} history - card.watch_history: {episodes: [{season, episode}], last: {season, episode}}
 * @param {object} counts - seasons(): серий в сезонах, может быть пустым (тогда total из number_of_episodes)
 * @param {object} [card] - карточка: number_of_episodes / number_of_seasons, если сезоны неизвестны
 * @returns {{watched:number, total:number, seasons:number, percent:number, current:number|null, groups:array, next:object|null, finished:boolean}}
 */
function progress(history, counts, card = {}){
    let by_season = {}
    let watched   = 0

    ;(history.episodes || []).forEach(e=>{
        let season  = parseInt(e.season)
        let episode = parseInt(e.episode)

        if(!(season > 0) || !(episode > 0)) return

        by_season[season] = by_season[season] || {}

        if(!by_season[season][episode]){
            by_season[season][episode] = true

            watched++
        }
    })

    let known   = Object.keys(counts || {}).map(n=>parseInt(n)).sort((a, b)=>a - b)
    let total   = known.length ? known.reduce((sum, n)=>sum + counts[n], 0) : parseInt(card.number_of_episodes) || 0
    let last    = history.last && history.last.season > 0 ? history.last : null
    let current = last ? parseInt(last.season) : (Object.keys(by_season).length ? Math.max.apply(null, Object.keys(by_season).map(n=>parseInt(n))) : null)
    let count   = (n)=>Object.keys(by_season[n] || {}).length
    let groups  = []

    if(known.length && current){
        let before = known.filter(n=>n < current)
        let after  = known.filter(n=>n > current)

        if(before.length){
            let seen = before.reduce((sum, n)=>sum + Math.min(count(n), counts[n]), 0)
            let all  = before.reduce((sum, n)=>sum + counts[n], 0)

            groups.push({type: 'done', from: before[0], to: before[before.length - 1], watched: seen, total: all, complete: seen >= all})
        }

        groups.push({type: 'now', from: current, to: current, watched: count(current), total: counts[current] || 0, complete: counts[current] ? count(current) >= counts[current] : false})

        if(after.length){
            groups.push({type: 'ahead', from: after[0], to: after[after.length - 1], watched: after.reduce((sum, n)=>sum + count(n), 0), total: after.reduce((sum, n)=>sum + counts[n], 0)})
        }
    }

    let following = next(last, counts)

    return {
        watched,
        total,
        seasons: known.length || parseInt(card.number_of_seasons) || 0,
        percent: total ? Math.min(100, Math.round(watched / total * 100)) : 0,
        current,
        groups,
        next: following,
        finished: Boolean(last) && !following
    }
}

/**
 * Серии без отметки в истории, но с тайм-кодом больше 1% — тоже просмотрены (смотрели до истории CUB, на другом устройстве, без досмотра)
 * @param {object} counts - серий в сезонах: проверяются все серии всех известных сезонов
 * @param {array} episodes - серии из истории [{season, episode}] — их не проверяем
 * @param {function} read - (season, episode) => тайм-код {percent, updated}
 * @returns {[{season:number, episode:number, watched_at:number, timeline:true}]} - watched_at = updated тайм-кода, 0 — даты нет
 */
function fromTimeline(counts, episodes, read){
    let seen   = {}
    let result = []

    ;(episodes || []).forEach(e=>seen[e.season + ':' + e.episode] = true)

    Object.keys(counts || {}).map(n=>parseInt(n)).sort((a, b)=>a - b).forEach(season=>{
        for(let episode = 1; episode <= counts[season]; episode++){
            if(seen[season + ':' + episode]) continue

            let road = read(season, episode)

            if(road && parseFloat(road.percent) > 1) result.push({season, episode, watched_at: parseInt(road.updated) || 0, timeline: true})
        }
    })

    return result
}

/**
 * История карточки вместе с сериями из тайм-кодов
 * @param {object} history - card.watch_history
 * @param {array} extra - fromTimeline()
 * @returns {object} - копия history: episodes — все серии, last — последняя по дате (без дат и без отметок в истории — самая дальняя серия),
 *   watched_at — последний просмотр с учётом тайм-кодов
 */
function merge(history, extra){
    let result = Object.assign({}, history)

    if(!extra || !extra.length) return result

    let dated  = extra.filter(e=>e.watched_at > 0).sort((a, b)=>b.watched_at - a.watched_at)[0]
    let last   = history.last && history.last.season > 0 ? history.last : null

    result.episodes = (history.episodes || []).concat(extra.map(e=>({season: e.season, episode: e.episode})))

    if(dated && (!last || dated.watched_at > (last.watched_at || 0))) last = {season: dated.season, episode: dated.episode, watched_at: dated.watched_at}

    if(!last){
        let far = extra.slice().sort((a, b)=>b.season - a.season || b.episode - a.episode)[0]

        last = {season: far.season, episode: far.episode, watched_at: 0}
    }

    result.last       = last
    result.watched_at = Math.max(history.watched_at || 0, dated ? dated.watched_at : 0)

    return result
}

/**
 * Следующая серия после последней просмотренной
 * @param {{season:number, episode:number}|null} last
 * @param {object} counts - серий в сезонах; без них — просто следующий номер
 * @returns {{season:number, episode:number}|null} - null, если сериал досмотрен
 */
function next(last, counts){
    if(!last || !(last.season > 0) || !(last.episode > 0)) return null

    let season  = parseInt(last.season)
    let episode = parseInt(last.episode) + 1
    let known   = Object.keys(counts || {}).map(n=>parseInt(n)).sort((a, b)=>a - b)

    if(!known.length || !counts[season] || episode <= counts[season]) return {season, episode}

    let following = known.find(n=>n > season)

    return following ? {season: following, episode: 1} : null
}

/**
 * Просмотры по дням (местное время): новые дни первыми; внутри дня серии одного сезона подряд (не дольше 3 ч между ними) — одна строка
 * @param {array} rows - history/card: [{season, episode, watched_at}]
 * @returns {[{time:number, count:number, items:[{time:number, season:number|null, from:number|null, to:number|null}]}]} - time дня — полночь
 */
function days(rows){
    let map = {}

    ;(rows || []).slice().sort((a, b)=>a.watched_at - b.watched_at).forEach(row=>{
        let date = new Date(row.watched_at)

        date.setHours(0, 0, 0, 0)

        let key = date.getTime()
        let day = map[key] || (map[key] = {time: key, count: 0, items: []})
        let ep  = row.episode === null || row.episode === undefined ? null : parseInt(row.episode)
        let sn  = row.season === null || row.season === undefined ? null : parseInt(row.season)
        let one = day.items[day.items.length - 1]

        day.count++

        if(one && sn !== null && ep !== null && one.season === sn && one.to !== null && ep == one.to + 1 && row.watched_at - one.time <= SESSION){
            one.to   = ep
            one.time = row.watched_at
        }
        else day.items.push({time: row.watched_at, season: sn, from: ep, to: ep})
    })

    return Object.keys(map).map(key=>map[key]).sort((a, b)=>b.time - a.time).map(day=>{
        day.items.reverse()

        return day
    })
}

/**
 * Подряд идущие номера: [1,2,3,5] → [[1,3],[5,5]]
 */
function ranges(numbers){
    let result = []

    ;[...new Set(numbers)].sort((a, b)=>a - b).forEach(n=>{
        let last = result[result.length - 1]

        if(last && n == last[1] + 1) last[1] = n
        else result.push([n, n])
    })

    return result
}

/**
 * Форма слова по числу: 'серия|серии|серий' (славянские языки), 'episode|episodes' или одна форма
 * @param {number} n
 * @param {string} forms - формы через |
 * @returns {string}
 */
function plural(n, forms){
    let list = (forms || '').split('|')

    n = Math.abs(parseInt(n) || 0)

    if(list.length >= 3){
        let mod10  = n % 10
        let mod100 = n % 100

        if(mod10 == 1 && mod100 != 11) return list[0]
        if(mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return list[1]

        return list[2]
    }

    if(list.length == 2) return n == 1 ? list[0] : list[1]

    return list[0]
}

export default {
    seasons,
    progress,
    fromTimeline,
    merge,
    next,
    days,
    ranges,
    plural
}
