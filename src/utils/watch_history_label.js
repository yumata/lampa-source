/**
 * Подпись серий на карточке «Истории» (просмотры CUB, сгруппированные по дням):
 *   одна серия            → S01E04
 *   серии одного сезона   → S01 E1–3, 5  (больше двух диапазонов — S01 E1–3, 5…)
 *   несколько сезонов     → S01–S02 ×7
 *   фильм дважды за день  → ×2
 * @param {object} data - card.watch_history: {season, episode, episodes: [{season, episode}], views}
 * @param {boolean} tv - сериал
 * @returns {string} - пустая строка, если подписывать нечего
 */
function label(data, tv){
    let pad      = (n)=>('0' + n).slice(-2)
    let episodes = (data.episodes || []).filter(e=>e && e.season !== null && e.season !== undefined && e.episode !== null && e.episode !== undefined)
    let views    = parseInt(data.views) || 1

    if(!tv) return views > 1 ? '×' + views : ''

    // старый ответ без группировки — одна серия из самой записи
    if(!episodes.length && data.season !== null && data.season !== undefined){
        episodes = [{season: data.season, episode: data.episode}]
    }

    if(!episodes.length) return views > 1 ? '×' + views : ''

    if(episodes.length == 1){
        let one = episodes[0]

        return 'S' + pad(one.season) + (one.episode !== null && one.episode !== undefined ? 'E' + pad(one.episode) : '')
    }

    let seasons = [...new Set(episodes.map(e=>e.season))].sort((a, b)=>a - b)

    if(seasons.length > 1) return 'S' + pad(seasons[0]) + '–S' + pad(seasons[seasons.length - 1]) + ' ×' + episodes.length

    // диапазоны подряд идущих серий: 1,2,3,5 → 1–3, 5
    let numbers = [...new Set(episodes.map(e=>e.episode))].sort((a, b)=>a - b)
    let ranges  = []

    numbers.forEach(n=>{
        let last = ranges[ranges.length - 1]

        if(last && n == last[1] + 1) last[1] = n
        else ranges.push([n, n])
    })

    let parts = ranges.map(r=>r[0] == r[1] ? r[0] + '' : r[0] + '–' + r[1])

    return 'S' + pad(seasons[0]) + ' E' + parts.slice(0, 2).join(', ') + (parts.length > 2 ? '…' : '')
}

export default {
    label
}
