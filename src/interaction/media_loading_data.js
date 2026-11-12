function languageCode(value){
    return String(value || '').toLowerCase().split(/[-_]/)[0]
}

function selectLogo(logos, language){
    if(!Array.isArray(logos) || !logos.length) return false

    let preferred = languageCode(language)
    let ordered = [preferred, 'en', null].filter((code, index, list)=>code !== '' && list.indexOf(code) === index)

    for(let i = 0; i < ordered.length; i++){
        let code = ordered[i]
        let logo = logos.find(item => code === null ? !item.iso_639_1 : languageCode(item.iso_639_1) === code)

        if(logo && logo.file_path) return logo
    }

    return logos.find(item => item.file_path) || false
}

const ETA_MIN_BYTES = 512 * 1024
const ETA_MIN_PERCENT = 5
const ETA_MIN_SAMPLES = 2
const ETA_MAX_SECONDS = 10 * 60
const SPEED_EMA_PREV = 0.75
const SPEED_EMA_CUR = 0.25

/**
 * Оценка оставшегося времени предзагрузки по сглаженной скорости.
 * Нулевая скорость тоже входит в сглаживание: при остановке загрузки оценка растёт и скрывается
 * @returns {{push: function(number, number, number): number|null}}
 */
function createEta(){
    let ema = 0
    let samples = 0

    return {
        push(preloaded, total, speed){
            preloaded = Number(preloaded) || 0
            total = Number(total) || 0
            speed = Math.max(0, Number(speed) || 0)

            if(ema || speed > 0){
                samples++
                ema = ema ? SPEED_EMA_PREV * ema + SPEED_EMA_CUR * speed : speed
            }

            let remain = Math.max(0, total - preloaded)
            let percent = total > 0 ? preloaded * 100 / total : 0

            if(ema <= 0 || remain <= 0 || samples < ETA_MIN_SAMPLES) return null
            if(preloaded < ETA_MIN_BYTES && percent < ETA_MIN_PERCENT) return null

            let seconds = remain / ema

            return seconds <= ETA_MAX_SECONDS ? seconds : null
        }
    }
}

/**
 * Форматирует секунды: ~7 с, ~2:05
 * @param {number} seconds
 * @param {string} unit - подпись секунд
 * @returns {string}
 */
function formatEta(seconds, unit){
    if(!isFinite(seconds) || seconds < 0) return ''

    seconds = Math.round(seconds)

    if(seconds < 60) return '~' + seconds + ' ' + unit

    let min = Math.floor(seconds / 60)
    let sec = seconds % 60

    return '~' + min + ':' + (sec < 10 ? '0' : '') + sec
}

/**
 * Округляет значение скорости до целого: "61.84 Мбит/c" -> "62 Мбит/c"
 * @param {string} text
 * @returns {string}
 */
function roundSpeed(text){
    let value = String(text == null ? '' : text).trim()
    let match = value.match(/^(\d+(?:[.,]\d+)?)(.*)$/)

    if(!match) return value

    return Math.round(parseFloat(match[1].replace(',', '.'))) + match[2]
}

/**
 * Данные для Loading.setProgress из ответа TorrServer (&preload / &stat)
 * @param {object} res - ответ TorrServer
 * @param {string} speed - подпись скорости
 * @param {number|null} eta - оставшееся время в секундах
 * @returns {object}
 */
function preloadDetail(res, speed, eta){
    res = res || {}

    return {
        speed: speed,
        active_peers: parseInt(res.active_peers || 0),
        total_peers: parseInt(res.total_peers || 0),
        seeders: res.connected_seeders,
        preloaded: res.preloaded_bytes || 0,
        preload_size: res.preload_size || 0,
        eta: eta === undefined ? null : eta
    }
}

/**
 * Готовит строки для капсулы. Для отсутствующих данных возвращает null (в интерфейсе — прочерк)
 * @param {object} stats - данные из preloadDetail
 * @param {function(number): string} size - форматирование размера
 * @param {string} unit - подпись секунд
 * @returns {{peers: string|null, speed: string|null, seeds: string|null, buffer: string|null, eta: string|null}}
 */
function statusText(stats, size, unit){
    stats = stats || {}

    let active = parseInt(stats.active_peers)
    let total = parseInt(stats.total_peers)
    let seeders = parseInt(stats.seeders)
    let speed = stats.speed ? roundSpeed(stats.speed) : ''
    let preload_size = stats.preload_size || 0

    return {
        peers: isNaN(active) ? null : active + ' / ' + (isNaN(total) ? '—' : total),
        // нулевая скорость — это отсутствие данных, а не «0» без единицы
        speed: speed && parseFloat(speed) > 0 ? speed : null,
        seeds: stats.preload_size !== undefined && !isNaN(seeders) ? String(seeders) : null,
        buffer: preload_size ? size(stats.preloaded || 0) + ' / ' + size(preload_size) : null,
        eta: stats.eta == null ? null : formatEta(stats.eta, unit) || null
    }
}

export {
    languageCode,
    selectLogo,
    createEta,
    formatEta,
    roundSpeed,
    preloadDetail,
    statusText
}
