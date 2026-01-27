import Storage from '../core/storage/storage'
import Noty from '../interaction/noty'
import Lang from './lang'

// Константы
const POLLING_INTERVAL_MS = 5000
const DEFAULT_VLC_PORT = 3999
const DEFAULT_VLC_PASSWORD = '123456'

// Состояние
let vlcCallbacks = {}
let pollingInterval = null

/** Внимание! Кто будет делать свое приложение на electron и т.п.
 * Запустите прокси с помощью cors-anywhere или http-proxy-middleware на 4000 порту
 */
function getVLCURL(port) {
    const proxy = !['localhost', 'file://'].includes(window.location.origin);
    let url = `http://localhost:${port}/requests/status.json`

    if (proxy) {
        // url = `http://localhost:4000/${url}/requests/status.json`
        url = `http://localhost:4000/vlc/requests/status.json`
    }
    return url
}
/**
 * Подключение к VLC API
 * @param {number} port - порт VLC HTTP API
 * @param {string} password - пароль для авторизации
 * @returns {Promise<boolean>}
 */
function connectToVLC(port = DEFAULT_VLC_PORT, password = DEFAULT_VLC_PASSWORD) {
    const headers = {
        'Authorization': `Basic ${btoa(':' + password)}`
    }

    return fetch(getVLCURL(port), {headers})
        .then(response => {
            if (!response.ok) {
                throw new Error('VLC API недоступен')
            }
            return true
        })
}

/**
 * Запуск периодического опроса timecode из VLC
 * @param {string} hash - идентификатор сессии
 * @param {Object} data - данные сессии
 * @param {number} port - порт VLC
 * @param {string} password - пароль VLC
 */
function startTimecodePolling(hash, data, port = DEFAULT_VLC_PORT, password = DEFAULT_VLC_PASSWORD) {
    // Останавливаем предыдущий пуллинг
    stopTimecodePolling()

    pollingInterval = setInterval(() => {
        const headers = {
            'Authorization': `Basic ${btoa(':' + password)}`
        }

        fetch(getVLCURL(port), {headers})
            .then(response => response.json())
            .then(status => {
                if (status.time && status.length) {
                    const currentTime = status.time / 1000 // мс → сек
                    const duration = status.length / 1000   // мс → сек
                    const percent = Math.round((currentTime / duration) * 100)

                    // Вызов callback, если он зарегистрирован
                    if (vlcCallbacks[hash]) {
                        vlcCallbacks[hash](percent, currentTime, duration)
                    }
                }
            })
            .catch(error => {
                console.error('VLC', 'Ошибка получения timecode из VLC:', error)
                stopTimecodePolling()
            })
    }, POLLING_INTERVAL_MS)
}

/**
 * Остановка периодического опроса timecode
 */
function stopTimecodePolling() {
    if (pollingInterval) {
        clearInterval(pollingInterval)
        pollingInterval = null
    }
}

/**
 * Запуск VLC плеера
 * @param {string} url - URL медиафайла
 * @param {Object} data - дополнительные данные
 * @param {Object} options - опции запуска (port, password)
 */
function openPlayer(url, data, options = {}) {
    const {
        port = DEFAULT_VLC_PORT,
        password = DEFAULT_VLC_PASSWORD,
        fullscreen = true
    } = options
    const file = require('fs')

    // Подготовка аргументов для VLC
    const startTime = (data.timeline?.time ?? 0) * 1000
    const vlcArgs = [
        '--extraintf=http',
        '--http-host=localhost',
        `--http-port=${port}`,
        `--http-password=${password}`,
        `--start-time=${startTime}`,
        '--play-and-exit',
        '--no-loop',
        encodeURI(url)
    ]
    if (fullscreen) {
        vlcArgs.push('--fullscreen')
    }

    const playerPath = Storage.field('player_nw_path')

    // Попытка запуска VLC
    if (file.existsSync(playerPath)) {
        const spawn = require('child_process').spawn
        spawn(playerPath, vlcArgs)
    } else {
        Noty.show(Lang.translate('player_not_found') + ': ' + playerPath)
    }

    // Ожидание запуска VLC и начало отслеживания
    setTimeout(() => {
        connectToVLC(port, password)
            .then(() => {
                if (data.timeline) {
                    vlcCallbacks[data.timeline.hash] = data.timeline.handler
                    startTimecodePolling(data.timeline.hash, data, port, password)
                }
            })
            .catch(error => {
                console.error('VLC', 'Ошибка подключения к VLC:', error)
            })
    }, POLLING_INTERVAL_MS)
}

export default {
    openPlayer,
    stopTimecodePolling
}
