import HistoryLabel from '../src/utils/watch_history_label'

import {expect, suite, test} from 'vitest'

const ep = (season, episode)=>({season, episode})

suite('Подпись серий в «Истории»', () => {
    test('одна серия', () => {
        expect(HistoryLabel.label({episodes: [ep(1, 4)], views: 1}, true)).toBe('S01E04')
    })

    test('подряд идущие серии одного сезона', () => {
        expect(HistoryLabel.label({episodes: [ep(1, 1), ep(1, 2), ep(1, 3)], views: 3}, true)).toBe('S01 E1–3')
    })

    test('с пропуском и больше двух диапазонов', () => {
        expect(HistoryLabel.label({episodes: [ep(2, 1), ep(2, 2), ep(2, 5)], views: 3}, true)).toBe('S02 E1–2, 5')
        expect(HistoryLabel.label({episodes: [ep(2, 1), ep(2, 3), ep(2, 5), ep(2, 6)], views: 4}, true)).toBe('S02 E1, 3…')
    })

    test('несколько сезонов', () => {
        expect(HistoryLabel.label({episodes: [ep(1, 10), ep(2, 1), ep(2, 2)], views: 3}, true)).toBe('S01–S02 ×3')
    })

    test('фильм: один просмотр — без подписи, повтор за день — ×2', () => {
        expect(HistoryLabel.label({episodes: [], views: 1}, false)).toBe('')
        expect(HistoryLabel.label({episodes: [], views: 2}, false)).toBe('×2')
    })

    test('старый ответ без группировки — серия из записи', () => {
        expect(HistoryLabel.label({season: 3, episode: 7}, true)).toBe('S03E07')
        expect(HistoryLabel.label({season: null, episode: null}, true)).toBe('')
    })
})
