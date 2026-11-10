import {readdirSync, readFileSync} from 'node:fs'
import {describe, expect, test} from 'vitest'
import {languageCode, selectLogo, createEta, formatEta, roundSpeed, preloadDetail, statusText} from '../src/interaction/media_loading_data'

describe('Media loading artwork', () => {
    let logos = [
        {iso_639_1: null, file_path: '/neutral.png'},
        {iso_639_1: 'en', file_path: '/english.png'},
        {iso_639_1: 'uk', file_path: '/ukrainian.png'}
    ]

    test('normalizes regional TMDB language codes', () => {
        expect(languageCode('uk-UA')).toBe('uk')
        expect(languageCode('EN_us')).toBe('en')
    })

    test('prefers the configured language logo', () => {
        expect(selectLogo(logos, 'uk-UA').file_path).toBe('/ukrainian.png')
    })

    test('falls back to English and then language-neutral artwork', () => {
        expect(selectLogo(logos, 'pl').file_path).toBe('/english.png')
        expect(selectLogo([logos[0]], 'pl').file_path).toBe('/neutral.png')
    })

    test('returns false when no logo artwork is available', () => {
        expect(selectLogo([], 'uk')).toBe(false)
    })
})

describe('Media loading ETA and formatting', () => {
    test('formats seconds and minutes', () => {
        expect(formatEta(7.2, 's')).toBe('~7 s')
        expect(formatEta(125, 's')).toBe('~2:05')
        expect(formatEta(-1, 's')).toBe('')
    })

    test('rounds speed labels to whole numbers', () => {
        expect(roundSpeed('61.84 Mbps')).toBe('62 Mbps')
        expect(roundSpeed('7,2 Мбит/c')).toBe('7 Мбит/c')
        expect(roundSpeed('')).toBe('')
    })

    test('waits for enough samples and data before showing ETA', () => {
        let eta = createEta()
        let mb = 1024 * 1024

        expect(eta.push(0.1 * mb, 64 * mb, 1 * mb)).toBe(null)
        expect(eta.push(0.2 * mb, 64 * mb, 1 * mb)).toBe(null)
        expect(eta.push(8 * mb, 64 * mb, 2 * mb)).toBeGreaterThan(0)
    })

    test('hides ETA when it exceeds ten minutes or buffer is full', () => {
        let eta = createEta()
        let mb = 1024 * 1024

        eta.push(10 * mb, 4000 * mb, 0.1 * mb)

        expect(eta.push(10 * mb, 4000 * mb, 0.1 * mb)).toBe(null)
        expect(createEta().push(64 * mb, 64 * mb, mb)).toBe(null)
    })

    test('ETA grows and then disappears when the download stalls', () => {
        let eta = createEta()
        let mb = 1024 * 1024

        eta.push(8 * mb, 64 * mb, 4 * mb)

        let first = eta.push(8 * mb, 64 * mb, 4 * mb)
        let results = []

        for(let i = 0; i < 20; i++) results.push(eta.push(8 * mb, 64 * mb, 0))

        expect(first).toBeGreaterThan(0)
        expect(results[0]).toBeGreaterThan(first)
        expect(results[results.length - 1]).toBe(null)
    })
})

describe('Media loading payload and status text', () => {
    let size = value => value + 'B'

    test('maps a TorrServer response to progress details', () => {
        let detail = preloadDetail({
            active_peers: '15', total_peers: 100, connected_seeders: 14,
            preloaded_bytes: 25, preload_size: 64, download_speed: 7
        }, '62 Mbps', 5.2)

        expect(detail).toEqual({
            speed: '62 Mbps', active_peers: 15, total_peers: 100, seeders: 14,
            preloaded: 25, preload_size: 64, eta: 5.2
        })
    })

    test('builds all capsule strings from complete data', () => {
        let text = statusText(preloadDetail({
            active_peers: 21, total_peers: 541, connected_seeders: 14,
            preloaded_bytes: 25, preload_size: 64
        }, '61.84 Mbps', 7), size, 's')

        expect(text).toEqual({peers: '21 / 541', speed: '62 Mbps', seeds: '14', buffer: '25B / 64B', eta: '~7 s'})
    })

    test('returns null for missing values so the UI can show dashes', () => {
        expect(statusText(null, size, 's')).toEqual({peers: null, speed: null, seeds: null, buffer: null, eta: null})
        expect(statusText({speed: '0.0', active_peers: 3}, size, 's').speed).toBe(null)
        expect(statusText({active_peers: 3}, size, 's').peers).toBe('3 / —')
    })

    test('does not show seeds without preload statistics', () => {
        expect(statusText({seeders: 5}, size, 's').seeds).toBe(null)
    })
})

describe('Media loading localization', () => {
    let keys = [
        'torrent_preload_seeds', 'torrent_preload_sec'
    ]
    let dir = new URL('../src/lang/', import.meta.url)
    let files = readdirSync(dir).filter(name => name.endsWith('.js') && name !== 'meta.js')

    test('covers every language shipped with Lampa', () => {
        expect(files.length).toBe(13)
    })

    test.each(files)('%s has all preload capsule keys', (name) => {
        let source = readFileSync(new URL(name, dir), 'utf8')

        keys.forEach(key => expect(source).toMatch(new RegExp('^\\s*' + key + ':', 'm')))
    })
})
