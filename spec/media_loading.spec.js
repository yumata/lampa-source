import {describe, expect, test} from 'vitest'
import {languageCode, selectLogo} from '../src/interaction/media_loading_data'

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
