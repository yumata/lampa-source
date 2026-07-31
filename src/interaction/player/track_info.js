const language_codes = {
    ara: 'ar', arm: 'hy', hye: 'hy', aze: 'az', bel: 'be', bul: 'bg', chi: 'zh', zho: 'zh',
    cze: 'cs', ces: 'cs', dan: 'da', dut: 'nl', nld: 'nl', eng: 'en', est: 'et', fin: 'fi',
    fre: 'fr', fra: 'fr', geo: 'ka', kat: 'ka', ger: 'de', deu: 'de', gre: 'el', ell: 'el',
    heb: 'he', hin: 'hi', hun: 'hu', ice: 'is', isl: 'is', ita: 'it', jpn: 'ja', kaz: 'kk',
    kor: 'ko', lav: 'lv', lit: 'lt', mac: 'mk', mkd: 'mk', nor: 'no', per: 'fa', fas: 'fa',
    pol: 'pl', por: 'pt', rum: 'ro', ron: 'ro', rus: 'ru', slo: 'sk', slk: 'sk', slv: 'sl',
    spa: 'es', swe: 'sv', tur: 'tr', ukr: 'uk', uzb: 'uz', vie: 'vi'
}

const codec_names = {
    aac: 'AAC', aac_lc: 'AAC-LC', aac_ssr: 'AAC-SSR', aac_ltp: 'AAC-LTP',
    he_aac: 'HE-AAC', he_aac_v2: 'HE-AACv2', aac_latm: 'AAC',
    ac3: 'Dolby Digital', dolbydigital: 'Dolby Digital',
    eac3: 'Dolby Digital+', eac3_ddp_atmos: 'Dolby Digital+ · Atmos',
    dca: 'DTS', dts: 'DTS', dtshd_hra: 'DTS-HD HRA', dtshd_ma: 'DTS-HD MA',
    dtsma: 'DTS-HD MA', dtshd_ma_x: 'DTS-HD MA · DTS:X',
    dtshd_ma_x_imax: 'DTS-HD MA · DTS:X IMAX',
    truehd: 'TrueHD', truehd_atmos: 'TrueHD · Atmos',
    flac: 'FLAC', mp1: 'MP1', mp2: 'MP2', mp3: 'MP3', mp3float: 'MP3',
    opus: 'Opus', vorbis: 'Vorbis', ogg: 'OGG', alac: 'ALAC', ape: 'APE',
    pcm: 'PCM', pcm_bluray: 'PCM', pcm_s16le: 'PCM', pcm_s24le: 'PCM',
    wav: 'WAV', wavpack: 'WavPack', wmapro: 'WMA Pro', wmav2: 'WMA'
}

function languageCode(value){
    let code = String(value || '').trim().toLowerCase().replace(/_/g, '-').split('-')[0]

    if(code == 'ua') code = 'uk'

    return language_codes[code] || code
}

function languageName(value, translate, unknown){
    let source = String(value || '').trim()

    if(!source) return unknown

    let code = languageCode(source)

    if(/^[a-z]{2}$/.test(code)){
        let key = 'filter_lang_' + code
        let name = translate(key)

        if(name && name !== key) return name
    }

    return source.toUpperCase() == source && source.length <= 3 ? source.toUpperCase() : source
}

function codecName(value){
    let source = String(value || '').trim()

    if(!source) return ''

    let key = source.toLowerCase()
        .split(';')[0]
        .replace(/^audio\/(?:x-)?/, '')
        .replace(/^a_/, '')
        .replace(/[ .-]+/g, '_')

    return codec_names[key] || source.replace(/^audio\/(?:x-)?/i, '').toUpperCase()
}

function channelLayout(value){
    if(value === undefined || value === null || value === '') return ''

    if(typeof value == 'string' && !/^\d+(?:\.\d+)?(?:\s*ch)?$/i.test(value.trim())){
        return value.replace(/\s*\(side\)/i, '').replace(/^mono$/i, '1.0').replace(/^stereo$/i, '2.0')
    }

    let channels = parseInt(value)
    let layouts = {1: '1.0', 2: '2.0', 3: '2.1', 4: '4.0', 5: '5.0', 6: '5.1', 7: '6.1', 8: '7.1'}

    return layouts[channels] || (channels ? channels + ' Ch' : '')
}

function usefulDescription(tags){
    let title = tags && (tags.title || tags.TITLE)
    let handler = tags && (tags.handler_name || tags.HANDLER_NAME)
    let description = String(title || handler || '').trim()

    return /^(sound|audio)\s*handler$/i.test(description) ? '' : description
}

function tracksFromFfprobe(streams){
    if(!Array.isArray(streams)) return []

    return streams.filter(stream=>stream && stream.codec_type == 'audio').map(stream=>{
        let tags = stream.tags || {}

        return {
            language: tags.language || tags.LANGUAGE || '',
            label: usefulDescription(tags),
            extra: {
                channels: stream.channel_layout || stream.channels,
                fourCC: stream.codec_name || stream.codec_long_name || ''
            }
        }
    })
}

export {
    languageCode,
    languageName,
    codecName,
    channelLayout,
    tracksFromFfprobe
}
