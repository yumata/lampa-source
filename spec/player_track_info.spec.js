import {describe, expect, test} from 'vitest'
import {channelLayout, codecName, languageCode, languageName, tracksFromFfprobe} from '../src/interaction/player/track_info'

describe('Player audio track info', () => {
    test('formats the raw Tizen values like Kodi', () => {
        let translate = key=>key == 'filter_lang_uk' ? 'Українська' : key

        expect(languageCode('ukr')).toBe('uk')
        expect(languageName('ukr', translate, 'Невідомо')).toBe('Українська')
        expect(codecName('audio/x-ac3')).toBe('Dolby Digital')
        expect(channelLayout(6)).toBe('5.1')
    })

    test('uses Kodi-style names for common codecs', () => {
        expect(codecName('eac3')).toBe('Dolby Digital+')
        expect(codecName('A_DTS')).toBe('DTS')
        expect(codecName('truehd_atmos')).toBe('TrueHD · Atmos')
        expect(channelLayout('stereo')).toBe('2.0')
    })

    test('takes the voice studio description from the MKV track title', () => {
        expect(tracksFromFfprobe([{
            index: 11,
            codec_type: 'audio',
            codec_name: 'ac3',
            channels: 6,
            tags: {language: 'ukr', title: 'DniproFilm'}
        }])).toEqual([{
            language: 'ukr',
            label: 'DniproFilm',
            extra: {channels: 6, fourCC: 'ac3'}
        }])
    })

    test('does not show generic container handler names as a studio', () => {
        expect(tracksFromFfprobe([{
            codec_type: 'audio',
            tags: {language: 'eng', handler_name: 'SoundHandler'}
        }])[0].label).toBe('')
    })
})
