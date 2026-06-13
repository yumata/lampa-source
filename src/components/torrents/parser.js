import Voices from './voices'

/**
 * Torrent Title Decoder
 * Разбирает название торрента и возвращает структурированные данные
 * @param {string} title
 * @returns {{ season: number|null, episodes: string|null, year: number|null, quality: string|null, resolution: string|null }}
 */
function general(title) {
    let result = {
        season:     null,
        seasons:    [],
        episodes:   null,
        year:       null,
        quality:    null,
        resolution: null,
    }

    if(!title) return result

    // ─── Season ───────────────────────────────────────────────────────────────
    // "4 сезон", "4 сезон:"       → 4
    // "Season 3"                  → 3
    // "[S01-02]"                  → '1-2' (диапазон сезонов)
    // "04x01"                     → 4  (NNxMM)
    // "S03E01", "S03"             → 3
    let season_range =
        title.match(/\[S(\d{1,2})[-–](\d{1,2})\]/i)          ||
        title.match(/(?:сезон|season)\s*(\d{1,2})[-–](\d{1,2})/i) ||
        title.match(/(\d{1,2})[-–](\d{1,2})\s*(?:сезон|season)/i)

    if(season_range){
        result.season = parseInt(season_range[1]) + '-' + parseInt(season_range[2])
    }
    else{
        let season =
            title.match(/(\d+)\s*(?:сезон|season)/i)        ||
            title.match(/(?:сезон|season):?\s*(\d{1,2})/i)        ||
            title.match(/(\d{1,2})[nd|rd] season/i)        ||
            title.match(/(?:тв|tv)-(\d+)/i)        ||
            title.match(/\b(\d{1,2})x\d{1,2}/i)  ||
            title.match(/\bs(\d{1,2})e/i)         ||
            title.match(/\bs(\d{1,2})\b/i)

        if(season) result.season = parseInt(season[1])
    }

    if(!result.season) result.season = 1  // Если сезон не указан, предполагаем что это 1-й сезон

    if(typeof result.season === 'string' && result.season.indexOf('-') !== -1){
        let parts = result.season.split('-')
        let from  = parseInt(parts[0])
        let to    = parseInt(parts[1])
        for(let i = from; i <= to; i++) result.seasons.push(i)
    }
    else{
        result.seasons = [parseInt(result.season)]
    }

    // ─── Episodes ─────────────────────────────────────────────────────────────
    // "04x01-07 из 10"            → '1-7'
    // "1-4 серия из 10"           → '1-4'
    // "[1- из 10]", "(1- из 10)"  → '1-10'
    // "(3-10 из 20)"              → '3-10'
    // "[12 из 12]", "(12 из 12)"  → '12'
    // "S01E05", "E05", "5 серия"  → '5'

    // NNxMM-KK format
    let ep_nx = title.match(/\d{1,2}x(\d{1,2})[-–](\d{1,2})/i)

    if(ep_nx){
        result.episodes = parseInt(ep_nx[1]) + '-' + parseInt(ep_nx[2])
    }
    else{
        // Range with optional "серия/из"
        let ep_range =
            title.match(/(\d+)\s*[-–]\s*(\d+)\s*(?:серия|episode)/i)             ||
            title.match(/(\d{1,3})[-–](\d{1,3})\s*серии/i) ||
            title.match(/[[(](\d{1,3})\s*[-–](\d{1,3})\s*(?:из|з|of)\s*(\d{1,3})/i)        ||
            title.match(/[[(](\d{1,3})\s*[-–]\s*(?:из|з|of)\s*(\d{1,3})/i)        ||
            title.match(/[[(](\d{1,3})\s*(?:из|з|of)\s*(\d{1,3})[\])]/i)        ||
            title.match(/[e](\d{1,3})\s*[-–]\s*(?:(?:из|з|of)\s+)?(\d{1,3})/i) ||
            title.match(/(?:серии|серія|episodes)\s*(\d{1,3})\s*(?:(?:из|з|of)\s+)?(\d{1,3})/i) ||
            title.match(/(?:серии|серія|episodes)\s*(\d{1,3})[-–](\d{1,3})\s*(?:(?:из|з|of)\s+)?(\d{1,3})/i) ||
            title.match(/(?:серии|episodes):\s*(\d+)[-–](\d+)/i)

        if(ep_range){
            // Убеждаемся что это не диапазон годов (1990-2024)
            let a = parseInt(ep_range[1])
            let b = parseInt(ep_range[2])
            let looks_like_years = a >= 1900 && b >= 1900

            if(!looks_like_years){
                result.episodes = a == b ? '1-' + b : a > 1 ? '1-' + a : a + '-' + b
            }
        }
        else{
            // Single episode
            let ep_single =
                title.match(/\bs\d{1,2}e(\d+)/i)                  ||
                title.match(/\d{1,2}x(\d{1,2})\b/i)                ||
                title.match(/\be(\d{1,2})\b/i)                     ||
                title.match(/[[(](\d{1,2})\s+(?:из|з|of)\s+\d{1,2}[\])]/)           ||
                title.match(/(\d{1,2})\s+(?:из|з|of)\s+\d{1,2}/)           ||
                title.match(/(\d+)\s*(?:серия|episode)/i)

            if(ep_single) result.episodes = '1-' + String(parseInt(ep_single[1]))
        }
    }

    // ─── Year ─────────────────────────────────────────────────────────────────
    // "(2022-2023)"  → 2022  (диапазон лет — берём первый)
    // "(2024)"       → 2024
    // bare "2024"    → 2024
    let year =
        title.match(/\(((?:19|20)\d{2})[-–](?:19|20)\d{2}\)/)  ||
        title.match(/\(((?:19|20)\d{2})\)/)                      ||
        title.match(/\b((?:19|20)\d{2})\b/)

    if(year) result.year = parseInt(year[1])

    // ─── Quality ──────────────────────────────────────────────────────────────
    // Порядок важен: более длинные/специфичные варианты идут первыми,
    // чтобы "WEB-DLRip" не поглощалось "WEB-DL" и т.д.
    let qualities = [
        'WEB-DLRip', 'WEB-DL', 'WEBRip', 'WEB',
        'Blu-Ray', 'BluRay', 'BDRip',
        'HDRip', 'HDTV',
        'DVDRip', 'DVD',
        'CAM', 'TS',
    ]

    for(let q of qualities){
        // Экранируем дефис, добавляем lookahead чтобы "WEB-DL" не совпадало с "WEB-DLRip"
        let pattern = q.replace(/-/g, '[-]?') + '(?![a-zA-Z])'

        if(new RegExp(pattern, 'i').test(title)){
            result.quality = q
            break
        }
    }

    // ─── Resolution ───────────────────────────────────────────────────────────
    let resolution_map = {
        '4k':    '4K',
        'uhd':   '4K',
        '2160p': '4K',
        '1440p': '2K',
        '1080p': 'FHD',
        '720p':  'HD',
        '480p':  'SD',
        '360p':  'LD',
    }

    let resolution = title.match(/\b(4K|UHD|2160p|1080p|720p|480p|360p)\b/i)

    if(resolution) result.resolution = resolution_map[resolution[1].toLowerCase()] || resolution[1]

    return result
}

function voices(title) {
    if(!title) return []

    let lower = title.toLowerCase()
    let found = []

    Voices.forEach(voice => {
        if(found.indexOf(voice) === -1 && lower.indexOf(voice.toLowerCase()) !== -1){
            found.push(voice)
        }
    })

    return found
}

export default {
    general,
    voices
}
