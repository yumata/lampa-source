import Storage from '../core/storage/storage'
import Noty from '../interaction/noty'
import Lang from './lang'

const POLLING_INTERVAL_MS = 5000
const MAX_FAILED_ATTEMPTS = 3

const PLAYER_TYPES = {
    VLC: 'vlc',
    MPC_HC: 'mpc-hc',
    MPC_BE: 'mpc-be',
    MPC_QT: 'mpc-qt',
    KMPLAYER: 'kmplayer'
}

const DEFAULT_PLAYER_CONFIG = {
    [PLAYER_TYPES.VLC]: {
        port: 3999,
        password: '123456',
        fullscreen: true
    },
    [PLAYER_TYPES.MPC_HC]: {
        port: 3999,
        password: null,
        fullscreen: true
    },
    [PLAYER_TYPES.MPC_BE]: {
        port: 3999,
        password: null,
        fullscreen: true
    },
    [PLAYER_TYPES.MPC_QT]: {
        port: 3999,
        password: null,
        fullscreen: true
    },
    [PLAYER_TYPES.KMPLAYER]: {
        port: 3999,
        password: null,
        fullscreen: true
    }
}

let playerCallbacks = {}
let pollingInterval = null
let lastSuccessfulTimecode = null
let currentPlayerProcess = null
let currentHash = null
let failedAttempts = 0
let currentPlayerConfig = null

/**
 * Получение URL API в зависимости от типа плеера
 */
function getPlayerURL(config) {
    switch (config.type) {
        case PLAYER_TYPES.VLC:
            return `http://localhost:${config.port}/requests/status.json`
        case PLAYER_TYPES.MPC_HC:
        case PLAYER_TYPES.MPC_BE:
        case PLAYER_TYPES.MPC_QT:
            return `http://localhost:${config.port}/variables.html`
        case PLAYER_TYPES.KMPLAYER:
            return `http://localhost:${config.port}/status.html`
        default:
            throw new Error(`Unknown player type: ${config.type}`)
    }
}

/**
 * Парсинг ответа MPC-HC/MPC-BE/MPC-QT из HTML
 */
function parseMPCResponse(html) {
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const getValue = (id) => {
        const element = doc.getElementById(id)
        return element ? element.textContent : null
    }

    const state = getValue('state')
    const position = getValue('position')
    const duration = getValue('duration')
    const statestring = getValue('statestring')
    const file = getValue('file')
    const filepath = getValue('filepath')

    return {
        state: state ? parseInt(state) : null,
        statestring: statestring,
        position: position ? parseInt(position) : null,
        duration: duration ? parseInt(duration) : null,
        file: file,
        filepath: filepath,
        volumelevel: getValue('volumelevel'),
        muted: getValue('muted'),
        playbackrate: getValue('playbackrate')
    }
}

/**
 * Парсинг ответа KMPlayer
 */
function parseKMPlayerResponse(text) {
    const startIndex = text.indexOf('OnStatus(')
    if (startIndex === -1) return null
    const argsStart = startIndex + 9
    const lastParen = text.lastIndexOf(')')
    if (lastParen === -1) return null
    const argsStr = text.substring(argsStart, lastParen)

    const args = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < argsStr.length; i++) {
        const char = argsStr.charAt(i)

        if (char === '"') {
            inQuotes = !inQuotes
        } else if (char === ',' && !inQuotes) {
            args.push(current.trim())
            current = ''
        } else {
            current += char
        }
    }
    args.push(current.trim())

    for (let i = 0; i < args.length; i++) {
        args[i] = args[i].trim()
        if (args[i].charAt(0) === '"' && args[i].charAt(args[i].length - 1) === '"') {
            args[i] = args[i].substring(1, args[i].length - 1)
        }
    }

    return {
        file: args[0] || null,
        statestring: args[1] || null,
        position: args[2] ? parseInt(args[2], 10) : null,
        duration: args[4] ? parseInt(args[4], 10) : null,
        url: args[8] || null
    }
}

/**
 * Парсинг ответа VLC из JSON
 */
function parseVLCResponse(json) {
    return {
        time: json.time,
        length: json.length,
        state: json.state,
        stats: json.stats
    }
}

/**
 * Нормализация данных таймкода из разных плееров
 */
function normalizeTimecode(playerData, config) {
    if (config.type === PLAYER_TYPES.VLC) {
        if (playerData.time != null && playerData.length) {
            // VLC возвращает секунды
            return {
                currentTime: playerData.time,
                duration: playerData.length,
                percent: Math.round((playerData.time / playerData.length) * 100)
            }
        }
    } else if (config.type === PLAYER_TYPES.MPC_HC || config.type === PLAYER_TYPES.MPC_BE || config.type === PLAYER_TYPES.MPC_QT || config.type === PLAYER_TYPES.KMPLAYER) {
        if (playerData.position && playerData.duration) {
            // MPC-HC, MPC-BE, MPC-QT и KMPlayer возвращают миллисекунды
            return {
                currentTime: playerData.position / 1000,
                duration: playerData.duration / 1000,
                percent: Math.round((playerData.position / playerData.duration) * 100)
            }
        }
    }

    return null
}

/**
 * Получение статуса плеера
 */
function getPlayerStatus(htmlOrJson, config) {
    if (config.type === PLAYER_TYPES.VLC) {
        return parseVLCResponse(htmlOrJson)
    } else if (config.type === PLAYER_TYPES.MPC_HC || config.type === PLAYER_TYPES.MPC_BE || config.type === PLAYER_TYPES.MPC_QT) {
        return parseMPCResponse(htmlOrJson)
    } else if (config.type === PLAYER_TYPES.KMPLAYER) {
        return parseKMPlayerResponse(htmlOrJson)
    }
    return null
}

/**
 * Сохранение таймкода при закрытии плеера
 */
function saveTimecodeOnPlayerClose(hash) {
    if (lastSuccessfulTimecode && hash && playerCallbacks[hash]) {
        console.log('Player', 'Процесс закрылся, сохраняем последний timecode:', lastSuccessfulTimecode)
        playerCallbacks[hash](
            lastSuccessfulTimecode.percent,
            lastSuccessfulTimecode.currentTime,
            lastSuccessfulTimecode.duration
        )

        stopTimecodePolling()
        delete playerCallbacks[hash]
        currentPlayerProcess = null
        currentHash = null
        currentPlayerConfig = null
    } else if (hash && playerCallbacks[hash]) {
        console.log('Player', 'Процесс закрылся, но timecode не был получен')
        stopTimecodePolling()
        delete playerCallbacks[hash]
        currentPlayerProcess = null
        currentHash = null
        currentPlayerConfig = null
    }
}

/**
 * Получение и сохранение статуса из плеера
 */
function fetchAndSaveTimecode(config, hash) {
    const fetchOptions = {}

    // Добавляем авторизацию только для VLC
    if (config.type === PLAYER_TYPES.VLC && config.password) {
        fetchOptions.headers = {
            'Authorization': `Basic ${btoa(':' + config.password)}`
        }
    }

    return fetch(getPlayerURL(config), fetchOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Player API вернул ошибку')
            }

            if (config.type === PLAYER_TYPES.VLC) {
                return response.json()
            } else if (config.type === PLAYER_TYPES.MPC_HC || config.type === PLAYER_TYPES.MPC_BE || config.type === PLAYER_TYPES.MPC_QT || config.type === PLAYER_TYPES.KMPLAYER) {
                return response.text()
            }
        })
        .then(data => {
            failedAttempts = 0

            const playerStatus = getPlayerStatus(data, config)

            if (playerStatus) {
                const timecode = normalizeTimecode(playerStatus, config)

                if (timecode) {
                    lastSuccessfulTimecode = timecode
                    // console.log('Player', 'Timecode обновлен:', lastSuccessfulTimecode)
                }
            }
        })
        .catch(error => {
            console.error('Player', 'Ошибка получения timecode:', error)
            failedAttempts++
            console.log('Player', `Неудачных попыток: ${failedAttempts}/${MAX_FAILED_ATTEMPTS}`)

            if (!currentPlayerProcess || failedAttempts >= MAX_FAILED_ATTEMPTS) {
                if (!currentPlayerProcess) {
                    console.log('Player', 'Процесс закрыт, останавливаем polling')
                } else {
                    console.log('Player', 'Превышен лимит неудачных попыток, останавливаем polling')
                }

                if (lastSuccessfulTimecode && playerCallbacks[hash]) {
                    console.log('Player', 'Сохраняем последний timecode перед остановкой')
                    playerCallbacks[hash](
                        lastSuccessfulTimecode.percent,
                        lastSuccessfulTimecode.currentTime,
                        lastSuccessfulTimecode.duration
                    )
                }

                stopTimecodePolling()
                if (playerCallbacks[hash]) {
                    delete playerCallbacks[hash]
                }
                currentHash = null
                currentPlayerConfig = null
            }

            throw error
        })
}

/**
 * Запуск периодического опроса timecode из плеера
 * @param {string} hash - идентификатор сессии
 * @param {Object} data - данные сессии
 * @param {Object} config - конфигурация плеера
 */
function startTimecodePolling(hash, data, config) {
    stopTimecodePolling()

    lastSuccessfulTimecode = null
    failedAttempts = 0
    currentPlayerConfig = config

    console.log('Player', 'Делаем первый запрос timecode')
    fetchAndSaveTimecode(config, hash).catch(error => {
        console.error('Player', 'Первый запрос не удался')
    })

    pollingInterval = setInterval(() => {
        if (!currentPlayerProcess) {
            console.log('Player', 'Процесс не найден, останавливаем polling')
            stopTimecodePolling()
            return
        }

        fetchAndSaveTimecode(config, hash).catch(error => {
            // Ошибка уже обработана в fetchAndSaveTimecode
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
        lastSuccessfulTimecode = null
        failedAttempts = 0
    }
}

/**
 * Получение аргументов командной строки для разных плееров
 */
function getPlayerArgs(config, url, data) {
    // const startTime = (data.timeline?.time ?? 0) * 1000
    const startTimeSec = (data.timeline?.time ?? 0)

    if (config.type === PLAYER_TYPES.VLC) {
        const vlcArgs = [
            '--extraintf=http',
            '--http-host=localhost',
            `--http-port=${config.port}`,
            `--http-password=${config.password}`,
            `--start-time=${startTimeSec}`,
            '--play-and-exit',
            '--no-loop',
            encodeURI(url)
        ]

        if (config.fullscreen !== false) {
            vlcArgs.push('--fullscreen')
        }

        return vlcArgs
    } else if (config.type === PLAYER_TYPES.MPC_HC || config.type === PLAYER_TYPES.MPC_BE || config.type === PLAYER_TYPES.MPC_QT || config.type === PLAYER_TYPES.KMPLAYER) {
        const mpcArgs = [
            url,
            '/webport', config.port.toString(),
            '/start', Math.floor(startTimeSec * 1000).toString(),
            '/play',
            '/close'
        ]

        if (config.fullscreen !== false) {
            mpcArgs.push('/fullscreen')
        }

        return mpcArgs
    }

    return []
}

/**
 * Запуск плеера
 * @param {string} url - URL медиафайла
 * @param {Object} data - дополнительные данные
 * @param {Object} options - опции запуска
 */
function openPlayer(url, data, options = {}) {
    const {
        type = PLAYER_TYPES.VLC,
        port = DEFAULT_PLAYER_CONFIG[type]?.port,
        password = DEFAULT_PLAYER_CONFIG[type]?.password,
        fullscreen = DEFAULT_PLAYER_CONFIG[type]?.fullscreen,
    } = options

    const file = require('fs')
    const config = {type, port, password, fullscreen}

    // Сохраняем hash сразу, чтобы он был доступен при закрытии
    if (data.timeline) {
        currentHash = data.timeline.hash
        playerCallbacks[data.timeline.hash] = data.timeline.handler
    }

    const playerPath = Storage.field('player_nw_path')
    const playerArgs = getPlayerArgs(config, url, data)

    console.log('Player', 'Путь:', playerPath)
    console.log('Player', 'Аргументы:', playerArgs)

    if (playerPath && file.existsSync(playerPath)) {
        const spawn = require('child_process').spawn

        if (currentPlayerProcess) {
            console.log('Player', 'Убиваем предыдущий процесс')
            currentPlayerProcess.kill()
            currentPlayerProcess = null
        }

        currentPlayerProcess = spawn(playerPath, playerArgs)

        const handleProcessClose = (code, signal) => {
            console.log('Player', 'Процесс закрыт с кодом:', code, 'сигнал:', signal)

            if (currentHash && playerCallbacks[currentHash]) {
                saveTimecodeOnPlayerClose(currentHash)
            } else {
                // Если нет колбэка, просто очищаем состояние
                stopTimecodePolling()
                currentHash = null
                currentPlayerConfig = null
            }

            currentPlayerProcess = null
        }

        currentPlayerProcess.on('close', handleProcessClose)

        currentPlayerProcess.on('error', (error) => {
            console.error('Player', 'Ошибка процесса:', error)
            if (currentPlayerProcess) {
                currentPlayerProcess = null
            }
            handleProcessClose(null, 'error')
        })

        currentPlayerProcess.on('exit', handleProcessClose)

    } else {
        Noty.show(Lang.translate('player_not_found') + ': ' + playerPath)
        return
    }

    setTimeout(() => {
        if (data.timeline && currentPlayerProcess) {
            startTimecodePolling(data.timeline.hash, data, config)
        }
    }, 2000)
}

export default {
    openPlayer,
    stopTimecodePolling,
    PLAYER_TYPES
}