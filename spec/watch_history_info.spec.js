import Info from '../src/utils/watch_history_info'

import {expect, suite, test} from 'vitest'

const ep = (season, episode)=>({season, episode})

// Симпсоны: сезоны 1–14 целиком, 15-й до 10 серии
const counts = {1: 13, 2: 22, 3: 24, 4: 22, 5: 22, 6: 25, 7: 25, 8: 25, 9: 25, 10: 23, 11: 22, 12: 21, 13: 22, 14: 22, 15: 22, 16: 21}

function simpsons(){
    let episodes = []

    for(let s = 1; s <= 14; s++) for(let e = 1; e <= counts[s]; e++) episodes.push(ep(s, e))
    for(let e = 1; e <= 10; e++) episodes.push(ep(15, e))

    return {episodes, last: {season: 15, episode: 10}}
}

suite('«История»: серии в сезонах', () => {
    test('из TMDB без спецвыпусков, TimeTable уточняет свой сезон', () => {
        let detail = {seasons: [{season_number: 0, episode_count: 5}, {season_number: 1, episode_count: 10}, {season_number: 2, episode_count: 8}]}
        let table  = [{season_number: 2, episode_number: 1}, {season_number: 2, episode_number: 12}]

        expect(Info.seasons(detail, table)).toEqual({1: 10, 2: 12})
        expect(Info.seasons(null, null)).toEqual({})
    })

    test('из idsview: seasons объектом', () => {
        expect(Info.seasons({seasons: {'0': 21, '1': 13, '2': 22}}, [])).toEqual({1: 13, 2: 22})
        expect(Info.seasons({seasons: {'1': 25, '2': 4}}, [{season_number: 2, episode_number: 12}])).toEqual({1: 25, 2: 12})
    })
})

suite('«История»: прогресс сериала', () => {
    test('досмотрены / сейчас / впереди', () => {
        let result = Info.progress(simpsons(), counts)

        expect(result.watched).toBe(323)
        expect(result.total).toBe(313 + 22 + 21)
        expect(result.seasons).toBe(16)
        expect(result.current).toBe(15)
        expect(result.groups).toEqual([
            {type: 'done', from: 1, to: 14, watched: 313, total: 313, complete: true},
            {type: 'now', from: 15, to: 15, watched: 10, total: 22, complete: false},
            {type: 'ahead', from: 16, to: 16, watched: 0, total: 21}
        ])
        expect(result.next).toEqual({season: 15, episode: 11})
        expect(result.finished).toBe(false)
    })

    test('повторы серий не считаются дважды, сезоны неизвестны — всего из карточки', () => {
        let result = Info.progress({episodes: [ep(1, 1), ep(1, 1), ep(1, 2)], last: {season: 1, episode: 2}}, {}, {number_of_episodes: 10, number_of_seasons: 2})

        expect(result).toMatchObject({watched: 2, total: 10, seasons: 2, percent: 20, groups: [], next: {season: 1, episode: 3}})
    })

    test('первый сезон — без «досмотрены», последняя серия последнего сезона — сериал досмотрен', () => {
        expect(Info.progress({episodes: [ep(1, 1)], last: ep(1, 1)}, {1: 2, 2: 3}).groups.map(g=>g.type)).toEqual(['now', 'ahead'])

        let done = Info.progress({episodes: [ep(1, 1), ep(1, 2), ep(2, 1), ep(2, 2), ep(2, 3)], last: ep(2, 3)}, {1: 2, 2: 3})

        expect(done).toMatchObject({percent: 100, next: null, finished: true})
    })
})

suite('«История»: серии по тайм-кодам', () => {
    // тайм-коды: S1E1 50% (без даты), S1E2 1% (не считается), S2E1 100% (с датой)
    const roads = {'1:1': {percent: 50, updated: 0}, '1:2': {percent: 1}, '2:1': {percent: 100, updated: 2000}, '1:3': {percent: 90, updated: 500}}
    const read  = (s, e)=>roads[s + ':' + e]

    test('больше 1% — просмотрена, серии из истории не проверяются', () => {
        let calls = []
        let result = Info.fromTimeline({1: 3, 2: 2}, [ep(1, 3)], (s, e)=>{ calls.push(s + ':' + e); return read(s, e) })

        expect(result).toEqual([{season: 1, episode: 1, watched_at: 0, timeline: true}, {season: 2, episode: 1, watched_at: 2000, timeline: true}])
        expect(calls).toEqual(['1:1', '1:2', '2:1', '2:2'])
    })

    test('последняя серия — по дате тайм-кода, если он новее истории', () => {
        let history = {episodes: [ep(1, 3)], last: {season: 1, episode: 3, watched_at: 1000}, watched_at: 1000}
        let merged  = Info.merge(history, Info.fromTimeline({1: 3, 2: 2}, history.episodes, read))

        expect(merged.last).toEqual({season: 2, episode: 1, watched_at: 2000})
        expect(merged.watched_at).toBe(2000)
        expect(Info.progress(merged, {1: 3, 2: 2})).toMatchObject({watched: 3, next: {season: 2, episode: 2}})
        expect(history.episodes.length).toBe(1)
    })

    test('история новее тайм-кодов — последняя из истории; без отметок и дат — самая дальняя серия', () => {
        let history = {episodes: [ep(1, 3)], last: {season: 1, episode: 3, watched_at: 5000}, watched_at: 5000}

        expect(Info.merge(history, Info.fromTimeline({1: 3, 2: 2}, history.episodes, read)).last.episode).toBe(3)
        expect(Info.merge({episodes: [], last: null}, [{season: 1, episode: 4, watched_at: 0}, {season: 1, episode: 7, watched_at: 0}]).last).toEqual({season: 1, episode: 7, watched_at: 0})
    })
})

suite('«История»: следующая серия', () => {
    test('конец сезона — первая серия следующего', () => {
        expect(Info.next(ep(1, 13), {1: 13, 2: 22})).toEqual({season: 2, episode: 1})
        expect(Info.next(ep(1, 5), {})).toEqual({season: 1, episode: 6})
        expect(Info.next(null, counts)).toBe(null)
    })
})

suite('«История»: по дням', () => {
    const at = (s)=>new Date(s).getTime()

    test('серии подряд за вечер — одна строка, перерыв или другой сезон — новая; новые первыми', () => {
        let result = Info.days([
            {season: 15, episode: 1, watched_at: at('2026-10-21T15:10:00')},
            {season: 15, episode: 2, watched_at: at('2026-10-21T22:40:00')},
            {season: 15, episode: 9, watched_at: at('2026-10-27T22:45:00')},
            {season: 15, episode: 10, watched_at: at('2026-10-27T23:05:00')}
        ])

        expect(result.length).toBe(2)
        expect(result[0]).toMatchObject({count: 2, items: [{season: 15, from: 9, to: 10, time: at('2026-10-27T23:05:00')}]})
        expect(result[1].items.map(i=>[i.from, i.to])).toEqual([[2, 2], [1, 1]])
    })

    test('фильм: каждый просмотр отдельно', () => {
        let result = Info.days([
            {season: null, episode: null, watched_at: at('2026-10-27T10:00:00')},
            {season: null, episode: null, watched_at: at('2026-10-27T12:00:00')}
        ])

        expect(result[0].count).toBe(2)
        expect(result[0].items.length).toBe(2)
    })
})

suite('«История»: формы слов', () => {
    test('славянские, две формы, одна', () => {
        expect([1, 2, 5, 11, 21, 22, 112, 780].map(n=>Info.plural(n, 'серия|серии|серий'))).toEqual(['серия', 'серии', 'серий', 'серий', 'серия', 'серии', 'серий', 'серий'])
        expect(Info.plural(1, 'episode|episodes') + Info.plural(3, 'episode|episodes')).toBe('episodeepisodes')
        expect(Info.plural(3, '集')).toBe('集')
        expect(Info.ranges([5, 1, 2, 3])).toEqual([[1, 3], [5, 5]])
    })
})
